use crate::*;
/// Price per 1 byte of storage from mainnet config after `1.18.0` release and protocol version `42`.
/// It's 10 times lower than the genesis price.

// Esto esta en yocto near
pub(crate) const YOCTO_NEAR: u128 = 1000000000000000000000000;
pub(crate) const STORAGE_PRICE_PER_BYTE: Balance = 10_000_000_000_000_000_000;

pub(crate) fn string_to_valid_account_id(account_id: &String) -> ValidAccountId{
    return ValidAccountId::try_from((*account_id).to_string()).unwrap();
}

pub(crate) fn unique_prefix(account_id: &AccountId) -> Vec<u8> {
    let mut prefix = Vec::with_capacity(33);
    prefix.push(b'o');
    prefix.extend(env::sha256(account_id.as_bytes()));
    prefix
}

pub(crate) fn deposit_refund(storage_used: u64) {
    let required_cost = STORAGE_PRICE_PER_BYTE * Balance::from(storage_used);
    let attached_deposit = env::attached_deposit();

    assert!(
        required_cost <= attached_deposit,
        "Requires to attach {:.1$} NEAR services to cover storage",required_cost as f64 / YOCTO_NEAR as f64, 3 // la presicion de decimales
    );

    let refund = attached_deposit - required_cost;
    if refund > 0 {
        Promise::new(env::predecessor_account_id()).transfer(refund);
    }
}

pub(crate) fn deposit_refund_to(storage_used: u64, to: AccountId) {
    env::log(format!("Storage cost per bytes: {}", env::storage_byte_cost()).as_bytes());
    let required_cost = env::storage_byte_cost() * Balance::from(storage_used);
    let attached_deposit = env::attached_deposit();

    assert!(
        required_cost <= attached_deposit,
        "Requires to attach {:.1$} NEAR services to cover storage",required_cost as f64 / YOCTO_NEAR as f64, 3 // la presicion de decimales
    );

    let refund = attached_deposit - required_cost;
    if refund > 0 {
        Promise::new(to).transfer(refund);
    }
}

// pub(crate) fn bytes_for_approved_account_id(account_id: &AccountId) -> u64 {
//     // The extra 4 bytes are coming from Borsh serialization to store the length of the string.
//     account_id.len() as u64 + 4
// }

// pub(crate) fn refund_approved_account_ids(
//     account_id: AccountId,
//     approved_account_ids: &HashSet<AccountId>,
// ) -> Promise {
//     let storage_released: u64 = approved_account_ids
//         .iter()
//         .map(bytes_for_approved_account_id)
//         .sum();
//     Promise::new(account_id).transfer(Balance::from(storage_released) * STORAGE_PRICE_PER_BYTE)
// }


    // #[private]
    // fn string_to_json(&self, service_id: ServiceId) -> Category {
    //     let example = Category {
    //         category: "Programmer".to_string(),
    //         subcategory: "Backend".to_string(),
    //         areas: "Python, SQL".to_string()
    //     };
    //     let serialized = serde_json::to_string(&example).unwrap();

    //     let string = format!("String: {}", &serialized);
    //     env::log(string.as_bytes());

    // // pub fn string_to_json(&self, service_id: ServiceId) -> Category {
    // pub fn string_to_json(&self) -> Category {
    //     let example = Category {
    //         category: "Programmer".to_string(),
    //         subcategory: "Backend".to_string(),
    //         areas: "Python, SQL".to_string()
    //     };
    //     let serialized = serde_json::to_string(&example).unwrap();

    //     let string = format!("String: {}", &serialized);
    //     env::log(string.as_bytes());

    //     let deserialized: Category = serde_json::from_str(&serialized).unwrap();
    //     deserialized

impl Marketplace {

    // pub(crate) fn internal_remove_service_from_owner(
    //     &mut self,
    //     account_id: &AccountId,
    //     service_id: &ServiceId,
    // ) {
    //     let mut services_set = self
    //         .services_by_account
    //         .get(account_id)
    //         .expect("Service should be owned by the sender");
    //     services_set.remove(service_id);
    //     if services_set.is_empty() {
    //         self.services_by_account.remove(account_id);
    //     } else {
    //         self.services_by_account.insert(account_id, &services_set);
    //     }
    // }

    // pub(crate) fn internal_transfer(
    //     &mut self,
    //     sender_id: &AccountId,
    //     receiver_id: &AccountId,
    //     service_id: &ServiceId,
    //     enforce_approval_id: Option<u64>,
    //     memo: Option<String>,
    // ) -> (AccountId, HashSet<AccountId>) {
    //     let Service {
    //         owner_id,
    //         metadata,
    //         employer_account_ids,
    //         employer_id,
    //     } = self.service_by_id.get(service_id).expect("Service not found");
    //     if sender_id != &owner_id && !employer_account_ids.contains(sender_id) {
    //         env::panic(b"Unauthorized");
    //     }

    //     if let Some(enforce_approval_id) = enforce_approval_id {
    //         assert_eq!(
    //             employer_id,
    //             enforce_approval_id,
    //             "The service approval_id is different from provided"
    //         );
    //     }

    //     assert_ne!(
    //         &owner_id, receiver_id,
    //         "The service owner and the receiver should be different"
    //     );

    //     env::log(
    //         format!(
    //             "Transfer {} from @{} to @{}",
    //             service_id, &owner_id, receiver_id
    //         )
    //         .as_bytes(),
    //     );

    //     self.internal_remove_service_from_owner(&owner_id, service_id);
    //     self.internal_add_service_to_owner(receiver_id, service_id);

    //     let service = Service {
    //         owner_id: receiver_id.clone(),
    //         metadata,
    //         employer_account_ids: Default::default(),
    //         employer_id: employer_id + 1,
    //     };
    //     self.service_by_id.insert(service_id, &service);

    //     if let Some(memo) = memo {
    //         env::log(format!("Memo: {}", memo).as_bytes());
    //     }

    //     (owner_id, employer_account_ids)
    // }

    // #[private]
    // fn string_to_json(&self, service_id: ServiceId) -> Category {
    //     let example = Category {
    //         category: "Programmer".to_string(),
    //         subcategory: "Backend".to_string(),
    //         areas: "Python, SQL".to_string()
    //     };
    //     let serialized = serde_json::to_string(&example).unwrap();

    //     let string = format!("String: {}", &serialized);
    //     env::log(string.as_bytes());

    // // pub fn string_to_json(&self, service_id: ServiceId) -> Category {
    // pub fn string_to_json(&self) -> Category {
    //     let example = Category {
    //         category: "Programmer".to_string(),
    //         subcategory: "Backend".to_string(),
    //         areas: "Python, SQL".to_string()
    //     };
    //     let serialized = serde_json::to_string(&example).unwrap();

    //     let string = format!("String: {}", &serialized);
    //     env::log(string.as_bytes());

    //     let deserialized: Category = serde_json::from_str(&serialized).unwrap();
    //     deserialized
    // }
}
