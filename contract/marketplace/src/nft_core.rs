// use crate::*;
// use near_sdk::json_types::{ValidAccountId};
// use near_sdk::{ext_contract, Gas, PromiseResult};

// const GAS_FOR_RESOLVE_TRANSFER: Gas = 10_000_000_000_000;
// const GAS_FOR_NFT_TRANSFER_CALL: Gas = 25_000_000_000_000 + GAS_FOR_RESOLVE_TRANSFER;
// const NO_DEPOSIT: Balance = 0;


// pub trait NonFungibleServiceCore {
//     fn nft_transfer(
//         &mut self,
//         receiver_id: ValidAccountId,
//         service_id: ServiceId,
//         enforce_approval_id: Option<u64>,
//         memo: Option<String>,
//     );

//     /// Returns `true` if the service was transferred from the sender's account.
//     fn nft_transfer_call(
//         &mut self,
//         receiver_id: ValidAccountId,
//         service_id: ServiceId,
//         enforce_approval_id: Option<u64>,
//         memo: Option<String>,
//         msg: String,
//     ) -> Promise;

//     fn nft_approve(&mut self, service_id: ServiceId, account_id: ValidAccountId, msg: Option<String>) -> bool;

//     fn nft_revoke(&mut self, service_id: ServiceId, account_id: ValidAccountId) -> bool;

//     fn nft_revoke_all(&mut self, service_id: ServiceId) -> bool;

//     fn nft_service(&self, service_id: ServiceId) -> Option<Service>;
// }

// #[ext_contract(ext_non_fungible_service_receiver)]
// trait NonFungibleServiceReceiver {
//     /// Returns `true` if the service should be returned back to the sender.
//     /// TODO: Maybe make it inverse. E.g. true to keep it.
//     fn nft_on_transfer(
//         &mut self,
//         sender_id: AccountId,
//         previous_owner_id: AccountId,
//         service_id: ServiceId,
//         msg: String,
//     ) -> Promise;
// }

// #[ext_contract(ext_non_fungible_approval_receiver)]
// trait NonFungibleServiceApprovalsReceiver {
//     fn nft_on_approve(
//         &mut self,
//         service_contract_id: AccountId,
//         service_id: ServiceId,
//         owner_id: AccountId,
//         approval_id: u64,
//         msg: Option<String>,
//     ) -> Promise;
// }

// #[ext_contract(ext_self)]
// trait NonFungibleServiceResolver {
//     fn nft_resolve_transfer(
//         &mut self,
//         owner_id: AccountId,
//         receiver_id: AccountId,
//         approved_account_ids: HashSet<AccountId>,
//         service_id: ServiceId,
//     ) -> bool;
// }

// trait NonFungibleServiceResolver {
//     fn nft_resolve_transfer(
//         &mut self,
//         owner_id: AccountId,
//         receiver_id: AccountId,
//         approved_account_ids: HashSet<AccountId>,
//         service_id: ServiceId,
//     ) -> bool;
// }

// #[near_bindgen]
// impl NonFungibleServiceCore for Marketplace {
//     #[payable]
//     fn nft_transfer(
//         &mut self,
//         receiver_id: ValidAccountId,
//         service_id: ServiceId,
//         enforce_approval_id: Option<u64>,
//         memo: Option<String>,
//     ) {
//         // assert_one_yocto();

//         let sender_id = env::predecessor_account_id();
//         let (previous_owner_id, approved_account_ids) = self.internal_transfer(
//             &sender_id,
//             receiver_id.as_ref(),
//             &service_id,
//             enforce_approval_id,
//             memo,
//         );

//         refund_approved_account_ids(previous_owner_id, &approved_account_ids);
//     }

//     #[payable]
//     fn nft_transfer_call(
//         &mut self,
//         receiver_id: ValidAccountId,
//         service_id: ServiceId,
//         enforce_approval_id: Option<u64>,
//         memo: Option<String>,
//         msg: String,
//     ) -> Promise {
//         assert_one_yocto();
//         let sender_id = env::predecessor_account_id();
//         let (owner_id, approved_account_ids) = self.internal_transfer(
//             &sender_id,
//             receiver_id.as_ref(),
//             &service_id,
//             enforce_approval_id,
//             memo,
//         );
//         // Initiating receiver's call and the callback
//         ext_non_fungible_service_receiver::nft_on_transfer(
//             sender_id.clone(),
//             owner_id.clone(),
//             service_id.clone(),
//             msg,
//             receiver_id.as_ref(),
//             NO_DEPOSIT,
//             env::prepaid_gas() - GAS_FOR_NFT_TRANSFER_CALL,
//         )
//         .then(ext_self::nft_resolve_transfer(
//             owner_id,
//             receiver_id.into(),
//             approved_account_ids,
//             service_id,
//             &env::current_account_id(),
//             NO_DEPOSIT,
//             GAS_FOR_RESOLVE_TRANSFER,
//         ))
//     }

//     // #[payable]
//     // fn nft_approve(
//     //     &mut self,
//     //     service_id: ServiceId,
//     //     account_id: ValidAccountId,
//     //     msg: Option<String>,
//     // ) -> bool {
//     //     let mut deposit = env::attached_deposit();
//     //     let account_id: AccountId = account_id.into();
//     //     let storage_required = bytes_for_approved_account_id(&account_id);
//     //     assert!(deposit >= storage_required as u128, "Deposit doesn't cover storage of account_id: {}", account_id.clone());

//     //     let mut service = self.services_by_id.get(&service_id).expect("Service not found");
//     //     assert_eq!(&env::predecessor_account_id(), &service.owner_id);

//     //     if service.employer_account_ids.insert(account_id.clone()) {
//     //         deposit -= storage_required as u128;

//     //         service.employer_id += 1;

//     //         self.services_by_id.insert(&service_id, &service);
//     //         ext_non_fungible_approval_receiver::nft_on_approve(
//     //             env::current_account_id(),
//     //             service_id,
//     //             service.owner_id,
//     //             service.employer_id,
//     //             msg,
//     //             &account_id,
//     //             deposit,
//     //             env::prepaid_gas() - GAS_FOR_NFT_TRANSFER_CALL,
//     //         );
//     //         true
//     //     } else {
//     //         false
//     //     }
//     // }

//     // #[payable]
//     // fn nft_revoke(
//     //     &mut self,
//     //     service_id: ServiceId,
//     //     account_id: ValidAccountId,
//     // ) -> bool {
//     //     assert_one_yocto();
//     //     let mut service = self.services_by_id.get(&service_id).expect("Service not found");
//     //     let predecessor_account_id = env::predecessor_account_id();
//     //     assert_eq!(&predecessor_account_id, &service.owner_id);
//     //     if service.employer_account_ids.remove(account_id.as_ref()) {
//     //         let storage_released = bytes_for_approved_account_id(account_id.as_ref());
//     //         Promise::new(env::predecessor_account_id())
//     //             .transfer(Balance::from(storage_released) * STORAGE_PRICE_PER_BYTE);
//     //         self.services_by_id.insert(&service_id, &service);
//     //         true
//     //     } else {
//     //         false
//     //     }
//     // }

//     // #[payable]
//     // fn nft_revoke_all(
//     //     &mut self,
//     //     service_id: ServiceId,
//     // ) -> bool {
//     //     assert_one_yocto();
//     //     let mut service = self.services_by_id.get(&service_id).expect("Service not found");
//     //     let predecessor_account_id = env::predecessor_account_id();
//     //     assert_eq!(&predecessor_account_id, &service.owner_id);
//     //     if !service.employer_account_ids.is_empty() {
//     //         refund_approved_account_ids(predecessor_account_id, &service.employer_account_ids);
//     //         service.employer_account_ids.clear();
//     //         self.services_by_id.insert(&service_id, &service);
//     //         true
//     //     } else {
//     //         false
//     //     }
//     // }

//     // fn nft_service(&self, service_id: ServiceId) -> Option<Service> {
//     //     self.services_by_id.get(&service_id)
//     // }
// }

// // #[near_bindgen]
// // impl NonFungibleServiceResolver for Marketplace {
// //     fn nft_resolve_transfer(
// //         &mut self,
// //         owner_id: AccountId,
// //         receiver_id: AccountId,
// //         approved_account_ids: HashSet<AccountId>,
// //         service_id: ServiceId,
// //     ) -> bool {
// //         assert_self();

// //         // Whether receiver wants to return service back to the sender, based on `nft_on_transfer`
// //         // call result.
// //         if let PromiseResult::Successful(value) = env::promise_result(0) {
// //             if let Ok(return_service) = near_sdk::serde_json::from_slice::<bool>(&value) {
// //                 if !return_service {
// //                     // Service was successfully received.
// //                     refund_approved_account_ids(owner_id, &approved_account_ids);
// //                     return true;
// //                 }
// //             }
// //         }

// //         let mut service = if let Some(service) = self.services_by_id.get(&service_id) {
// //             if &service.owner_id != &receiver_id {
// //                 // The service is not owner by the receiver anymore. Can't return it.
// //                 refund_approved_account_ids(owner_id, &approved_account_ids);
// //                 return true;
// //             }
// //             service
// //         } else {
// //             // The service was burned and doesn't exist anymore.
// //             refund_approved_account_ids(owner_id, &approved_account_ids);
// //             return true;
// //         };

// //         env::log(format!("Return {} from @{} to @{}", service_id, receiver_id, owner_id).as_bytes());

// //         self.internal_remove_service_from_owner(&receiver_id, &service_id);
// //         self.internal_add_service_to_owner(&owner_id, &service_id);
// //         service.owner_id = owner_id;
// //         refund_approved_account_ids(receiver_id, &service.employer_account_ids);
// //         service.employer_account_ids = approved_account_ids;
// //         self.services_by_id.insert(&service_id, &service);

// //         false
// //     }
// // }
