use crate::*;

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


/// Internal function to Option values
pub(crate) fn expect_value_found<T>(option: Option<T>, message: &[u8]) -> T {
    option.unwrap_or_else(|| env::panic(message))
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

#[near_bindgen]
impl Marketplace {

    /******************************/
    /***** INTERNAL FUNCTIONS  ****/
    /******************************/

    pub fn get_users(&self, from_index: u64, limit: u64) -> Vec<(AccountId, User)> {
        let keys = self.users.keys_as_vector();
        let values = self.users.values_as_vector();
        (from_index..std::cmp::min(from_index + limit, self.users.len()))
            .map(|index| (keys.get(index).unwrap(), values.get(index).unwrap()))
            .collect()
    }

    pub fn measure_min_service_storage_cost(&mut self) {
        let initial_storage_usage = env::storage_usage();
        let tmp_account_id = "a".repeat(64);
        let u = UnorderedSet::new(unique_prefix(&tmp_account_id));
        self.services_by_account.insert(&tmp_account_id, &u);

        let services_by_account_entry_in_bytes = env::storage_usage() - initial_storage_usage;
        let owner_id_extra_cost_in_bytes = (tmp_account_id.len() - self.contract_owner.len()) as u64;

        self.extra_storage_in_bytes_per_service =
            services_by_account_entry_in_bytes + owner_id_extra_cost_in_bytes;

        self.services_by_account.remove(&tmp_account_id);
    }

    pub fn update_user_mints(&mut self, quantity: u16) -> User {
        let sender = env::predecessor_account_id();
        let mut user = expect_value_found(self.users.get(&sender), "Before mint a service, create an user".as_bytes());
        
        // if user.mints + quantity > USER_MINT_LIMIT {
        //     env::panic(format!("Exceeded user mint limit {}", USER_MINT_LIMIT).as_bytes());
        // }
        user.mints += quantity;

        self.users.insert(&sender, &user);

        return user
    }

    /**************************/
    /******** ASSERTS  ********/
    /**************************/

    /// Verificar que sea el admin.
    pub fn assert_admin(&self) {
        assert_eq!(
            &env::predecessor_account_id(),
            &self.contract_owner,
            "Must be owner_id how call its function"
        );
    } 

    /// Verificar que el servicio exista.
    pub fn assert_service_exists(&self, service_id: &u64) {
        if *service_id > self.total_services {
            env::panic(b"The indicated service doesn't exist")
        }
    }

    /*******************************/
    /******* GET FUNCTIONS  ********/
    /*******************************/

    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet del usuario.
    pub fn get_user(&self, account_id: ValidAccountId) -> User {
        expect_value_found(self.users.get(&account_id.into()), b"No users found. Register the user first")
    }

    /// TODO(Sebas): Optimizar con paginacion
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet del usuario.
    pub fn get_users_by_role(&self, role: UserRoles, from_index: u64, limit: u64) -> Vec<User> {
        let mut users_by_role: Vec<User> = Vec::new();

        let users = self.get_users(from_index, limit);

        for (_account_id, user) in users.iter() {
            if user.roles.get(&role).is_some() {
                users_by_role.push((*user).clone());
            }
        }
        users_by_role
    }

    /// Obtener id de los servicios de un usuario.
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet del usuario.
    pub fn get_user_service_id(&self, account_id: ValidAccountId) -> Vec<u64> {
        return expect_value_found(self.services_by_account.get(&account_id.into()), "No users found or dont have any service".as_bytes()).to_vec();
    }

    /// Obtener los servicios de determinado usuario.
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet del usuario.
    /// * `only_on_sale`  - Retornar solo los services activos.
    pub fn get_user_services(&self, account_id: ValidAccountId, only_on_sale: bool) -> Vec<Service> {
        let mut services: Vec<Service> = Vec::new();
        let service_id = self.get_user_service_id(account_id.clone());
        for i in 0 .. service_id.len() {
            let service = expect_value_found(self.service_by_id.get(&service_id[i]), "Service id dont match".as_bytes());
            if only_on_sale {
                if service.on_sale {
                    services.push( service ); 
                }
            }
            else { services.push( service ); }
        }
        services
    }

    /// #Arguments
    /// * `service_id`
    pub fn get_service_by_id(&self, service_id: u64) -> Service {
        return expect_value_found(self.service_by_id.get(&service_id.into()), "Service not found".as_bytes());
    }

    /// Obtener los servicios y su metadata de un usuario
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet del usuario.
    pub fn get_service_by_ids(&self, ids: HashSet<u64>) -> Vec<Service> {
        if ids.len() > self.service_by_id.len() as usize {
            env::panic(b"The amounts of ids supere the amount of services");
        }
        if ids.len() > 10 {
            env::panic(b"Limited to get until 10 services at time");
        }
        let mut services: Vec<Service> = Vec::new();
        for id in ids.iter() {
            services.push(self.service_by_id.get(&id).expect("Service id dont match"));
        }
        return services
    }

    /// Obtener el total supply
    pub fn get_total_services(&self) -> u64 {
        self.total_services
    }

    pub fn get_services(&self, from_index: u64, limit: u64) -> Vec<Service>{
        let values = self.service_by_id.values_as_vector();
        return (from_index..std::cmp::min(from_index + limit, self.service_by_id.len()))
            .map(|index| values.get(index).unwrap())
            .collect();
    }

    pub fn get_supported_tokens(&self) -> Vec<AccountId> {
        self.tokens.to_vec()
    }

    pub fn get_ft_balance(&self, token: String) -> Balance {
        let sender = env::predecessor_account_id();
        if token == "usdc".to_string() {
            return self.usdc_balances.get(&sender).unwrap_or(0);
        }
        else {
            return self.jobs_balances.get(&sender).unwrap_or(0);
        }
    }

    pub fn get_ft_balance_of(&self, token: String, user: AccountId) -> Balance {
        if token == "usdc".to_string() {
            return self.usdc_balances.get(&user).unwrap_or(0);
        }
        else {
            return self.jobs_balances.get(&user).unwrap_or(0);
        }
    }

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

    //     // env::log(
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
    //         // env::log(format!("Memo: {}", memo).as_bytes());
    //     }

    //     (owner_id, employer_account_ids)
    // }
}