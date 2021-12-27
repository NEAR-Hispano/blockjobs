use crate::*;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, TreeMap, UnorderedSet};
use near_sdk::json_types::ValidAccountId;
use near_sdk::{
    assert_one_yocto, env, log, AccountId, Balance, BorshStorageKey, CryptoHash,
    IntoStorageKey, StorageUsage,ext_contract, Gas, PromiseResult
};
use std::collections::HashMap;

const GAS_FOR_RESOLVE_TRANSFER: Gas = 10_000_000_000_000;
const GAS_FOR_NFT_TRANSFER_CALL: Gas = 25_000_000_000_000 + GAS_FOR_RESOLVE_TRANSFER;
const NO_DEPOSIT: Balance = 0;

#[derive(BorshDeserialize, BorshSerialize)]
pub struct NonFungibleService {
    // owner of contract; this is the only account allowed to call `mint`
    pub owner_id: AccountId,
    // The storage size in bytes for each new service
    pub extra_storage_in_bytes_per_service: StorageUsage,
    // always required
    pub owner_by_id: TreeMap<ServiceId, AccountId>,
    // required by metadata extension
    pub service_metadata_by_id: Option<LookupMap<ServiceId, ServiceMetadata>>,
    // required by enumeration extension
    pub services_by_account: Option<LookupMap<AccountId, UnorderedSet<ServiceId>>>,
    // required by approval extension
    pub approvals_by_id: Option<LookupMap<ServiceId, HashMap<AccountId, u64>>>,
    pub next_approval_id_by_id: Option<LookupMap<ServiceId, u64>>,
}

#[derive(BorshStorageKey, BorshSerialize)]
pub enum StorageKey {
    ServicesPerOwner { account_hash: Vec<u8> },
    ServicePerOwnerInner { account_id_hash: CryptoHash },
}

pub trait NonFungibleServiceCore {
    fn nft_transfer(
        &mut self,
        receiver_id: ValidAccountId,
        service_id: ServiceId,
        enforce_approval_id: Option<u64>,
        memo: Option<String>,
    );

    /// Returns `true` if the service was transferred from the sender's account.
    fn nft_transfer_call(
        &mut self,
        receiver_id: ValidAccountId,
        service_id: ServiceId,
        enforce_approval_id: Option<u64>,
        memo: Option<String>,
        msg: String,
    ) -> Promise;

    fn nft_approve(&mut self, service_id: ServiceId, account_id: ValidAccountId, msg: Option<String>) -> bool;

    fn nft_revoke(&mut self, service_id: ServiceId, account_id: ValidAccountId) -> bool;

    fn nft_revoke_all(&mut self, service_id: ServiceId) -> bool;

    fn nft_service(&self, service_id: ServiceId) -> Option<Service>;
}

#[ext_contract(ext_non_fungible_service_receiver)]
trait NonFungibleServiceReceiver {
    /// Returns `true` if the service should be returned back to the sender.
    /// TODO: Maybe make it inverse. E.g. true to keep it.
    fn nft_on_transfer(
        &mut self,
        sender_id: AccountId,
        previous_owner_id: AccountId,
        service_id: ServiceId,
        msg: String,
    ) -> Promise;
}

#[ext_contract(ext_non_fungible_approval_receiver)]
trait NonFungibleServiceApprovalsReceiver {
    fn nft_on_approve(
        &mut self,
        service_contract_id: AccountId,
        service_id: ServiceId,
        owner_id: AccountId,
        approval_id: u64,
        msg: Option<String>,
    ) -> Promise;
}

#[ext_contract(ext_self)]
trait NonFungibleServiceResolver {
    fn nft_resolve_transfer(
        &mut self,
        owner_id: AccountId,
        receiver_id: AccountId,
        approved_account_ids: HashSet<AccountId>,
        service_id: ServiceId,
    ) -> bool;
}

trait NonFungibleServiceResolver {
    fn nft_resolve_transfer(
        &mut self,
        owner_id: AccountId,
        receiver_id: AccountId,
        approved_account_ids: HashSet<AccountId>,
        service_id: ServiceId,
    ) -> bool;
}

#[near_bindgen]
impl NonFungibleServiceCore for Contract {
    #[payable]
    fn nft_transfer(
        &mut self,
        receiver_id: ValidAccountId,
        service_id: ServiceId,
        enforce_approval_id: Option<u64>,
        memo: Option<String>,
    ) {
        assert_one_yocto();

        let sender_id = env::predecessor_account_id();
        let (previous_owner_id, approved_account_ids) = self.internal_transfer(
            &sender_id,
            receiver_id.as_ref(),
            &service_id,
            enforce_approval_id,
            memo,
        );

        refund_approved_account_ids(previous_owner_id, &approved_account_ids);
    }

    #[payable]
    fn nft_transfer_call(
        &mut self,
        receiver_id: ValidAccountId,
        service_id: ServiceId,
        enforce_approval_id: Option<u64>,
        memo: Option<String>,
        msg: String,
    ) -> Promise {
        assert_one_yocto();
        let sender_id = env::predecessor_account_id();
        let (owner_id, approved_account_ids) = self.internal_transfer(
            &sender_id,
            receiver_id.as_ref(),
            &service_id,
            enforce_approval_id,
            memo,
        );
        // Initiating receiver's call and the callback
        ext_non_fungible_service_receiver::nft_on_transfer(
            sender_id.clone(),
            owner_id.clone(),
            service_id.clone(),
            msg,
            receiver_id.as_ref(),
            NO_DEPOSIT,
            env::prepaid_gas() - GAS_FOR_NFT_TRANSFER_CALL,
        )
        .then(ext_self::nft_resolve_transfer(
            owner_id,
            receiver_id.into(),
            approved_account_ids,
            service_id,
            &env::current_account_id(),
            NO_DEPOSIT,
            GAS_FOR_RESOLVE_TRANSFER,
        ))
    }

    #[payable]
    fn nft_approve(
        &mut self,
        service_id: ServiceId,
        account_id: ValidAccountId,
        msg: Option<String>,
    ) -> bool {
        let mut deposit = env::attached_deposit();
        let account_id: AccountId = account_id.into();
        let storage_required = bytes_for_approved_account_id(&account_id);
        assert!(deposit >= storage_required as u128, "Deposit doesn't cover storage of account_id: {}", account_id.clone());

        let mut service = self.services_by_id.get(&service_id).expect("Service not found");
        assert_eq!(&env::predecessor_account_id(), &service.owner_id);

        if service.approved_account_ids.insert(account_id.clone()) {
            deposit -= storage_required as u128;

            service.approval_id += 1;

            self.services_by_id.insert(&service_id, &service);
            ext_non_fungible_approval_receiver::nft_on_approve(
                env::current_account_id(),
                service_id,
                service.owner_id,
                service.approval_id,
                msg,
                &account_id,
                deposit,
                env::prepaid_gas() - GAS_FOR_NFT_TRANSFER_CALL,
            );
            true
        } else {
            false
        }
    }

    #[payable]
    fn nft_revoke(
        &mut self,
        service_id: ServiceId,
        account_id: ValidAccountId,
    ) -> bool {
        assert_one_yocto();
        let mut service = self.services_by_id.get(&service_id).expect("Service not found");
        let predecessor_account_id = env::predecessor_account_id();
        assert_eq!(&predecessor_account_id, &service.owner_id);
        if service.approved_account_ids.remove(account_id.as_ref()) {
            let storage_released = bytes_for_approved_account_id(account_id.as_ref());
            Promise::new(env::predecessor_account_id())
                .transfer(Balance::from(storage_released) * STORAGE_PRICE_PER_BYTE);
            self.services_by_id.insert(&service_id, &service);
            true
        } else {
            false
        }
    }

    #[payable]
    fn nft_revoke_all(
        &mut self,
        service_id: ServiceId,
    ) -> bool {
        assert_one_yocto();
        let mut service = self.services_by_id.get(&service_id).expect("Service not found");
        let predecessor_account_id = env::predecessor_account_id();
        assert_eq!(&predecessor_account_id, &service.owner_id);
        if !service.approved_account_ids.is_empty() {
            refund_approved_account_ids(predecessor_account_id, &service.approved_account_ids);
            service.approved_account_ids.clear();
            self.services_by_id.insert(&service_id, &service);
            true
        } else {
            false
        }
    }

    fn nft_service(&self, service_id: ServiceId) -> Option<Service> {
        self.services_by_id.get(&service_id)
    }
}

#[near_bindgen]
impl NonFungibleServiceResolver for Contract {
    fn nft_resolve_transfer(
        &mut self,
        owner_id: AccountId,
        receiver_id: AccountId,
        approved_account_ids: HashSet<AccountId>,
        service_id: ServiceId,
    ) -> bool {
        assert_self();

        // Whether receiver wants to return service back to the sender, based on `nft_on_transfer`
        // call result.
        if let PromiseResult::Successful(value) = env::promise_result(0) {
            if let Ok(return_service) = near_sdk::serde_json::from_slice::<bool>(&value) {
                if !return_service {
                    // Service was successfully received.
                    refund_approved_account_ids(owner_id, &approved_account_ids);
                    return true;
                }
            }
        }

        let mut service = if let Some(service) = self.services_by_id.get(&service_id) {
            if &service.owner_id != &receiver_id {
                // The service is not owner by the receiver anymore. Can't return it.
                refund_approved_account_ids(owner_id, &approved_account_ids);
                return true;
            }
            service
        } else {
            // The service was burned and doesn't exist anymore.
            refund_approved_account_ids(owner_id, &approved_account_ids);
            return true;
        };

        env::log(format!("Return {} from @{} to @{}", service_id, receiver_id, owner_id).as_bytes());

        self.internal_remove_service_from_owner(&receiver_id, &service_id);
        self.internal_add_service_to_owner(&owner_id, &service_id);
        service.owner_id = owner_id;
        refund_approved_account_ids(receiver_id, &service.approved_account_ids);
        service.approved_account_ids = approved_account_ids;
        self.services_by_id.insert(&service_id, &service);

        false
    }
}

impl NonFungibleService {
    pub fn new<Q, R, S, T>(
        owner_by_id_prefix: Q,
        owner_id: ValidAccountId,
        service_metadata_prefix: Option<R>,
        enumeration_prefix: Option<S>,
        approval_prefix: Option<T>,
    ) -> Self
    where
        Q: IntoStorageKey,
        R: IntoStorageKey,
        S: IntoStorageKey,
        T: IntoStorageKey,
    {
        let (approvals_by_id, next_approval_id_by_id) = if let Some(prefix) = approval_prefix {
            let prefix: Vec<u8> = prefix.into_storage_key();
            (
                Some(LookupMap::new(prefix.clone())),
                Some(LookupMap::new([prefix, "n".into()].concat())),
            )
        } else {
            (None, None)
        };

        let mut this = Self {
            owner_id: owner_id.into(),
            extra_storage_in_bytes_per_service: 0,
            owner_by_id: TreeMap::new(owner_by_id_prefix),
            service_metadata_by_id: service_metadata_prefix.map(LookupMap::new),
            services_by_account: enumeration_prefix.map(LookupMap::new),
            approvals_by_id,
            next_approval_id_by_id,
        };
        this
    }


    /// Transfer service_id from `from` to `to`
    ///
    /// Do not perform any safety checks or do any logging
    pub fn internal_transfer_unguarded(
        &mut self,
        service_id: &ServiceId,
        from: &AccountId,
        to: &AccountId,
    ) {
        // update owner
        self.owner_by_id.insert(service_id, to);

        // if using Enumeration standard, update old & new owner's service lists
        if let Some(services_by_account) = &mut self.services_by_account {
            // owner_services should always exist, so call `unwrap` without guard
            let mut owner_services = services_by_account
                .get(from)
                .expect("Unable to access services per owner in unguarded call.");
            owner_services.remove(&service_id);
            if owner_services.is_empty() {
                services_by_account.remove(from);
            } else {
                services_by_account.insert(&from, &owner_services);
            }

            let mut receiver_services = services_by_account.get(to).unwrap_or_else(|| {
                UnorderedSet::new(StorageKey::ServicesPerOwner {
                    account_hash: env::sha256(to.as_bytes()),
                })
            });
            receiver_services.insert(&service_id);
            services_by_account.insert(&to, &receiver_services);
        }
    }

    /// Transfer from current owner to receiver_id, checking that sender is allowed to transfer.
    /// Clear approvals, if approval extension being used.
    /// Return previous owner and approvals.
    pub fn internal_transfer(
        &mut self,
        sender_id: &AccountId,
        receiver_id: &AccountId,
        service_id: &ServiceId,
        approval_id: Option<u64>,
        memo: Option<String>,
    ) -> (AccountId, Option<HashMap<AccountId, u64>>) {
        let owner_id = self.owner_by_id.get(service_id).expect("Service not found");

        // clear approvals, if using Approval Management extension
        // this will be rolled back by a panic if sending fails
        let approved_account_ids =
            self.approvals_by_id.as_mut().and_then(|by_id| by_id.remove(&service_id));

        // check if authorized
        if sender_id != &owner_id {
            // if approval extension is NOT being used, or if service has no approved accounts
            if approved_account_ids.is_none() {
                env::panic(b"Unauthorized")
            }

            // Approval extension is being used; get approval_id for sender.
            let actual_approval_id = approved_account_ids.as_ref().unwrap().get(sender_id);

            // Panic if sender not approved at all
            if actual_approval_id.is_none() {
                env::panic(b"Sender not approved");
            }

            // If approval_id included, check that it matches
            if let Some(enforced_approval_id) = approval_id {
                let actual_approval_id = actual_approval_id.unwrap();
                assert_eq!(
                    actual_approval_id, &enforced_approval_id,
                    "The actual approval_id {} is different from the given approval_id {}",
                    actual_approval_id, enforced_approval_id,
                );
            }
        }

        assert_ne!(&owner_id, receiver_id, "Current and next owner must differ");

        self.internal_transfer_unguarded(&service_id, &owner_id, &receiver_id);

        log!("Transfer {} from {} to {}", service_id, sender_id, receiver_id);
        if let Some(memo) = memo {
            log!("Memo: {}", memo);
        }

        // return previous owner & approvals
        (owner_id, approved_account_ids)
    }
}