// use near_env::PanicMessage;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, UnorderedSet};
use near_sdk::json_types::{ValidAccountId, U128};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, Balance, PanicOnDefault, Promise, PromiseResult, StorageUsage, ext_contract, Gas};

use std::collections::{HashSet};
use std::convert::TryFrom;

use crate::internal::*;
use crate::user::*;

mod internal;
mod user;

near_sdk::setup_alloc!();

// const ON_CALLBACK_GAS: u64 = 20_000_000_000_000;
// const GAS_FOR_RESOLVE_TRANSFER: Gas = 10_000_000_000_000;
// const GAS_FOR_NFT_TRANSFER_CALL: Gas = 25_000_000_000_000 + GAS_FOR_RESOLVE_TRANSFER;
// const SPONSOR_FEE: u128 = 100_000_000_000_000_000_000_000;

const NO_DEPOSIT: Balance = 0;
const BASE_GAS: Gas = 30_000_000_000_000;
const USER_MINT_LIMIT: u16 = 100;
const USERS_LIMIT: u16 = u16::MAX;
const ONE_DAY: u64 = 86400000000000;

// pub fn pseudo_random(seed: u8, num_of_digits: usize){
//     let n = (seed * seed).()
//      while(n.length < num_of_digits * 2 ){
//       n = "0" + n
//     }
//     start = Math.floor(num_of_digits / 2)
//     end = start + num_of_digits
//     seed = parseInt(n.substring(start, end))
//     return seed
//   }

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Service {
    pub id: u64,
    pub metadata: ServiceMetadata,
    pub creator_id: AccountId,
    pub actual_owner: AccountId,
    pub employers_account_ids: HashSet<AccountId>,
    // Días que va a durar el trabajo ofrecido 
    pub duration: u16,
    // Uso de timestamp para fijar momento de compra
    pub buy_moment: u64,
    // Determinar si esta en manos del profesional (false) o de un empleador (true)
    pub sold: bool,
    // Determinar si esta en venta
    pub on_sale: bool,
    // Determinar si esta en disputa
    pub on_dispute: bool,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct ServiceMetadata {
    pub title: String,
    pub description: String,
    pub icon: String,
    pub price: u128,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Category {
    pub category: String,
    pub subcategory: String,
    pub areas: String,
}

fn expect_value_found<T>(option: Option<T>, message: &[u8]) -> T {
    option.unwrap_or_else(|| env::panic(message))
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Marketplace {
    pub service_by_id: UnorderedMap<u64, Service>,
    pub services_by_account: LookupMap<AccountId, UnorderedSet<u64>>,
    pub total_services: u64,
    
    pub users: UnorderedMap<AccountId, User>,
    pub contract_owner: AccountId,
    pub contract_me: AccountId,
    pub contract_ft: AccountId,

    // The storage size in bytes for one account.
    pub extra_storage_in_bytes_per_service: StorageUsage,
}

#[near_bindgen]
impl Marketplace {
    /// Inicializa el contrato y asigna el propietario del contrato. El cual sera el primer admin
    ///
    /// #Arguments
    /// * `owner_id`    - La cuenta de mainnet/testnet de quien sera el owner del contrato.
    #[init]
    #[payable]
    pub fn new(owner_id: ValidAccountId, mediator: ValidAccountId, ft: ValidAccountId) -> Self {
        if env::state_exists() {
            env::panic("Contract already inicialized".as_bytes());
        }

        let mut this = Self {
            total_services: 0,
            services_by_account: LookupMap::new(b"a".to_vec()),
            service_by_id: UnorderedMap::new(b"t".to_vec()),
            users: UnorderedMap::new(b"u".to_vec()),
            contract_owner: owner_id.clone().into(),
            contract_me: mediator.clone().into(),
            contract_ft: ft.clone().into(),
            extra_storage_in_bytes_per_service: 0,
        };

        let mut roles: Vec<UserRoles> = Vec::new();
        roles.push(UserRoles::Admin);
        this.add_user_p(roles.clone(), owner_id.into(), "Categories { Programer: {Lenguajes: } }".to_string());
        this.add_user_p(roles.clone(), mediator.into(), "Categories { Programer: {Lenguajes: } }".to_string());
        this.add_user_p(roles, ft.into(), "Categories { Programer: {Lenguajes: } }".to_string());

        this.measure_min_service_storage_cost();
        return this;
    }
    
    /*** SERVICES FUNCTIONS ***/

    /// Mintea uno o varios servios de un usuario que sea un profesional (tambien si eres un admin)
    ///
    /// #Arguments
    /// * `metadata`             - La metadata que el profesional asigna a su servicio.
    /// * `on_sale_services`      - La cantidad de services que se desea mintear.
    #[payable]
    pub fn mint_service(&mut self, metadata: ServiceMetadata, quantity: u16, duration: u16) -> Service {
        let sender = env::predecessor_account_id();
        let user = self.update_user_mints(quantity); // Cantidad de servicios

        //Verificar que sea un profesional
        if !user.roles.get(&UserRoles::Professional).is_some() {
            env::panic("Only professionals can mint a service".as_bytes());
        }

        let initial_storage_usage = env::storage_usage();
        env::log(format!("initial store usage: {}", initial_storage_usage).as_bytes());

        let mut service = Service {
            id: self.total_services,
            creator_id: sender.clone(),
            metadata: metadata,
            employers_account_ids: Default::default(),
            actual_owner: sender.clone(),
            duration: duration,
            buy_moment: 0,
            sold: false,
            on_sale: true,
            on_dispute: false,
        };
        
        let mut services_set = self
            .services_by_account
            .get(&sender)
            .unwrap_or_else(|| UnorderedSet::new(unique_prefix(&sender)));

        for _i in 0 .. quantity {
            service.on_sale = true;

            if self.service_by_id.insert(&self.total_services, &service).is_some() {
                env::panic("Service already exists".as_bytes());
            }

            services_set.insert(&self.total_services);
            self.total_services += 1;
        }

        self.services_by_account.insert(&sender, &services_set);

        // Manejo de storage
        let new_services_size_in_bytes = env::storage_usage() - initial_storage_usage;
        env::log(format!("New services size in bytes: {}", new_services_size_in_bytes).as_bytes());

        let required_storage_in_bytes = self.extra_storage_in_bytes_per_service + new_services_size_in_bytes;
        env::log(format!("Required storage in bytes: {}", required_storage_in_bytes).as_bytes());

        deposit_refund(required_storage_in_bytes);

        // Retornar datos del servicio
        service
    }

    // Adquisición de un servicio
    #[payable]
    pub fn buy_service(&mut self, service_id: u64) {
        // Verificar que el servicio exista
        self.assert_service_exists(&service_id);

        let mut service = self.get_service_by_id(service_id.clone());
        // Verificar que este en venta
        if !service.on_sale {
            env::panic("The indicated service is not on sale".as_bytes())
        }

        let sender = env::predecessor_account_id();
        let buyer = self.get_user(string_to_valid_account_id(&sender).clone());

        // Verificar que sea empleador quien compra
        if buyer.roles.get(&UserRoles::Admin).is_none() && buyer.roles.get(&UserRoles::Employeer).is_none() {
            env::panic("Only employers can buy services".as_bytes());
        }
        
        // Verificar que no lo haya comprado ya
        if buyer.account_id == service.actual_owner.clone() {
            env::panic("Already is the service owner".as_bytes());
        }

        // Establecer como servicio vendido y no en venta
        service.sold = true;
        service.on_sale = false;

        // Cambiar propiedad del servicio
        service.actual_owner = sender.clone();
        self.delete_service(&service_id, &service.actual_owner);
        self.add_service(&service_id, &buyer.account_id);

        // Establecer tiempo de la compra
        service.buy_moment = env::block_timestamp();

        self.service_by_id.insert(&service_id, &service);

        // Realizar el pago que quedara en el contrato mediador
        let _res = ext_token::block_tokens(
            service.metadata.price,
            &self.contract_ft, NO_DEPOSIT, BASE_GAS)
        .then(ext_self::on_block_tokens(
            3,
            &env::current_account_id(), NO_DEPOSIT, BASE_GAS)
        );
    }


    /// Modificar la metadata de un servicio
    /// 
    pub fn update_service_metadata(&mut self, service_id: u64, metadata: ServiceMetadata) -> Service {
        // Verificar que el servicio exista
        self.assert_service_exists(&service_id);

        let mut service = self.get_service_by_id(service_id.clone());

        // Verificar que no este ya comprado
        if service.sold == true {
            env::panic(b"You can't modify while the service is in hands of the employer")
        }

        // Verificar que sea el creador quien ejecuta la funcion
        let sender_id = string_to_valid_account_id(&env::predecessor_account_id());
        let sender = self.get_user(sender_id.clone());
        let owner = service.creator_id.clone();
        let owner_id = string_to_valid_account_id(&owner);
        if (sender_id != owner_id) && sender.roles.get(&UserRoles::Admin).is_none() {
            env::panic("Only the creator or admins can change metadata services".as_bytes());
        }

        // Insertar nueva metadata
        service.metadata = metadata;
        self.service_by_id.insert(&service_id, &service);

        service
    }

    /// Cambio de la duración del servicio
    /// Solo ejecutable por el profesional que lo posee
    /// 
    pub fn change_service_duration(&mut self, service_id: u64, new_duration: u16) -> Service {
        // Verificar que exista el servicio
        self.assert_service_exists(&service_id);

        let sender = env::signer_account_id();
        let mut service = self.get_service_by_id(service_id);

        // Verificar que sea el creador del servicio
        if sender != service.creator_id {
            env::panic(b"Cannot modify because isn't the owner")
        }
        // Verificar que no este ya comprado
        if service.sold == true {
            env::panic(b"You can't modify while the service is in hands of the employer")
        }

        service.duration = new_duration;
        self.service_by_id.insert(&service_id, &service);

        service
    }

    /// Cambiar el estado de un servicio segun este en venta o no
    /// Solo para el profesional o administradores
    /// 
    pub fn change_service_on_sale(&mut self, service_id: u64, on_sale: bool) -> Service {
        // Verificar que el servicio exista
        self.assert_service_exists(&service_id);

        let mut service = self.get_service_by_id(service_id.clone());
        let sender = env::predecessor_account_id();
        let user = self.get_user(string_to_valid_account_id(&sender));

        let is_creator = service.creator_id == sender;

        // Verificar que sea el cleador
        if !user.roles.get(&UserRoles::Admin).is_some() && !is_creator {
            env::panic("Only the owner or admin can desactivate or activate the service".as_bytes());
        }

        // Verificar que no este ya comprado
        if service.sold == true {
            env::panic(b"You can't modify while the service is in hands of the employer")
        }

        service.on_sale = on_sale;
        self.service_by_id.insert(&service_id, &service);

        service
    }

    /// Retornar un servicio al creador
    /// Ejecutable solo por el admin, previa aprobacion de ambas partes
    /// 
    pub fn return_service(&mut self, service_id: &u64) -> Service {
        // Verificar que el servicio exista
        self.assert_service_exists(&service_id);

        let mut service = self.get_service_by_id(service_id.clone());

        let sender_id = string_to_valid_account_id(&env::predecessor_account_id());
        env::log(sender_id.to_string().as_bytes());
        let sender = self.get_user(sender_id.clone());
        if sender.roles.get(&UserRoles::Admin).is_none()  {
            env::panic("Only admins can give back the services".as_bytes());
        }

        self.delete_service(&service_id, &sender.account_id);
        self.add_service(&service_id, &service.creator_id);

        // Modificar la metadata del servicio pay_to_emplee
        service.actual_owner = service.creator_id.clone();
        service.on_sale = true;
        service.buy_moment = 0;
        self.service_by_id.insert(&service_id, &service);

        service
    }

    /// Retornar un servicio al creador
    /// 
    pub fn reclaim_service(&mut self, service_id: &u64) -> Service {
        // Verificar que el servicio exista
        self.assert_service_exists(service_id);

        let mut service = self.get_service_by_id(service_id.clone());

        // Verificar que haya pasado el tiempo establecido para poder hacer el reclamo
        if env::block_timestamp() < service.buy_moment + ONE_DAY * (service.duration as u64 + 2) {
            env::panic("Insuficient time to reclame the service".as_bytes());
        }

        // Verificar que el empleador no haya solicitado una disputa
        if service.on_dispute == true {
            env::panic(b"Actually the service is in dispute");
        }

        let sender_id = string_to_valid_account_id(&env::predecessor_account_id());
        env::log(sender_id.to_string().as_bytes());
        let sender = self.get_user(sender_id.clone());

        if service.creator_id != env::signer_account_id() {
            env::panic(b"Only the corresponding professional can reclaim the service");
        }

        self.delete_service(&service_id, &sender.account_id);
        self.add_service(&service_id, &service.creator_id);

        // Modificar los datos del servicio
        service.actual_owner = service.creator_id.clone();
        service.on_sale = true;
        service.buy_moment = 0;
        self.service_by_id.insert(&service_id, &service);

        service
    }

    /*** USERS FUNCTIONS ***/

    /// Registra usuarios, asignando su rol y a que se dedican por categorias
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet de quien sera registrado.
    /// * `role`        - El role que tendra el usuario. Solo los admin puenden decir quien es moderador.
    /// * `category`    - La categoria en la cual el usuario puede decir a que se dedica.
    #[payable]
    pub fn add_user(&mut self, roles: Vec<UserRoles>, categories: String) -> User {

        if self.users.len() >= USERS_LIMIT as u64 {
            env::panic(b"Users amount over limit");
        }

        let account_id: AccountId = env::predecessor_account_id();
        let services_set = UnorderedSet::new(unique_prefix(&account_id));
        self.services_by_account.insert(&account_id, &services_set);

        let initial_storage_usage = env::storage_usage();
        env::log(format!("initial store usage: {}", initial_storage_usage).as_bytes());

        let mut new_user = User{
            account_id: account_id.clone(),
            mints: 0,
            roles: HashSet::new(),
            rep: 0,
            categories: categories,
            links: None,
            education: None, 
        };

        for r in roles.iter() {
            new_user.roles.insert(*r);
        }

        if self.users.insert(&account_id, &new_user).is_some() {
            env::panic(b"User account already added");
        }

        let new_services_size_in_bytes = env::storage_usage() - initial_storage_usage;
        env::log(format!("New services size in bytes: {}", new_services_size_in_bytes).as_bytes());

        let required_storage_in_bytes = self.extra_storage_in_bytes_per_service + new_services_size_in_bytes;
        env::log(format!("Required storage in bytes: {}", required_storage_in_bytes).as_bytes());

        deposit_refund_to(required_storage_in_bytes, account_id);

        return new_user
    }

    #[payable]
    fn add_user_p(&mut self, roles: Vec<UserRoles>, account_id: AccountId, categories: String) -> User {
        let services_set = UnorderedSet::new(unique_prefix(&account_id));
        self.services_by_account.insert(&account_id, &services_set);

        let initial_storage_usage = env::storage_usage();
        env::log(format!("initial store usage: {}", initial_storage_usage).as_bytes());

        let mut new_user = User{
            account_id: account_id.clone(),
            mints: 0,
            roles: HashSet::new(),
            rep: 0,
            categories: categories,
            links: None,
            education: None, 
        };

        for r in roles.iter() {
            new_user.roles.insert(*r);
        }

        if self.users.insert(&account_id, &new_user).is_some() {
            env::panic(b"User account already added");
        }

        let new_services_size_in_bytes = env::storage_usage() - initial_storage_usage;
        env::log(format!("New services size in bytes: {}", new_services_size_in_bytes).as_bytes());

        let required_storage_in_bytes = self.extra_storage_in_bytes_per_service + new_services_size_in_bytes;
        env::log(format!("Required storage in bytes: {}", required_storage_in_bytes).as_bytes());

        deposit_refund_to(required_storage_in_bytes, account_id);

        return new_user
    }

    /// Eliminar un usuario
    /// Solo ejecutable por el admin
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet de quien sera registrado.
    pub fn remove_user(&mut self, account_id: ValidAccountId) {
        self.assert_admin(&env::predecessor_account_id());
        
        let user = self.get_user(account_id.clone());

        self.services_by_account.remove(&user.account_id);
        self.users.remove(&account_id.into());
    }

    /// Reescribe las categorias del usuario
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet de quien sera registrado.
    /// * `category`    - La categoria en la cual el usuario puede decir a que se dedica.
    pub fn update_user_categories(&mut self, account_id: ValidAccountId, categories: String) -> User {
        if env::predecessor_account_id() == account_id.to_string() {
            env::panic(b"Only the user cant modify it self");
        }

        let mut user = self.get_user(account_id.clone());
        user.categories = categories;
        self.users.insert(&account_id.into(), &user);

        return user;
    }

    /// Agregar o quitar un rol al usuario
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet de quien sera registrado.
    /// * `role`        - El role que tendra el usuario. Solo los admin puenden decir quien es moderador.
    pub fn set_user_role(&mut self, account_id: ValidAccountId, role: UserRoles, remove: bool) -> User {
        let is_user_sender = env::predecessor_account_id() != account_id.to_string();
        let is_owner_sender = env::predecessor_account_id() != self.contract_owner;

        if is_user_sender && is_owner_sender {
            env::panic(b"Only the user and admins cant modify it self");
        }
        if is_owner_sender && (role as u8 > 1) {
            env::panic(b"Only the admins cant grant the admin or mod role");
        }

        let mut user = self.get_user(account_id.clone());

        if !remove {
            user.roles.insert(role);
        }
        else {
            user.roles.remove(&role);
        }

        self.users.insert(&account_id.into(), &user);
        
        return user
    }


    /*** GET FUNCTIONS  ***/

    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet del usuario.
    pub fn get_user(&self, account_id: ValidAccountId) -> User {
        expect_value_found(self.users.get(&account_id.into()), "No users found. Register the user first".as_bytes())
    }

    // TODO(Sebas): Optimizar con paginacion
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

    /// Obtener id de los services de un usuario
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet del usuario.
    pub fn get_user_services_id(&self, account_id: ValidAccountId) -> Vec<u64> {
        return expect_value_found(self.services_by_account.get(&account_id.into()), "No users found or dont have any service".as_bytes()).to_vec();
    }

    /// Obtener los servicios de determinado usuario
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet del usuario.
    /// * `only_on_sale`  - Retornar solo los services activos.
    pub fn get_user_services(&self, account_id: ValidAccountId, only_on_sale: bool) -> Vec<Service> {
        let mut services: Vec<Service> = Vec::new();
        let services_id = self.get_user_services_id(account_id.clone());
        for i in 0 .. services_id.len() {
            let service = expect_value_found(self.service_by_id.get(&services_id[i]), "Service id dont match".as_bytes());
            if only_on_sale {
                if service.on_sale {
                    services.push( service ); 
                }
            }
            else {
                services.push( service );
            }
        }
        return services
    }


    /// #Arguments
    /// * `service_id`
    pub fn get_service_by_id(&self, service_id: u64) -> Service {
        return expect_value_found(self.service_by_id.get(&service_id.into()), "No users found. Register the user first".as_bytes());
    }

    // TODO(Sebas): Optimizar con colocar un limite
    /// Obtener los service y sus metadata de un usuario
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet del usuario.
    pub fn get_service_by_ids(&self, ids: HashSet<u64>) -> Vec<Service> {
        if ids.len() > self.service_by_id.len() as usize {
            env::panic(b"The amounts of ids supere the amount of services");
        }
        let mut services: Vec<Service> = Vec::new();
        for id in ids.iter() {
            services.push(self.service_by_id.get(&id).expect("Service id dont match"));
        }
        return services
    }

    /// Obtener el total supply
    /// 
    pub fn get_total_services(&self) -> u64 {
        self.total_services
    }

    /// Verificacion de datos para una disputa
    /// 
    pub fn validate_dispute(&mut self, applicant: AccountId, accused: AccountId, service_id: u64, jugdes: u8, exclude: Vec<ValidAccountId>) -> Vec<AccountId> {
        if  (env::signer_account_id() != self.contract_me) ||
            (env::predecessor_account_id() != self.contract_me)
        {
            env::panic(b"Only the mediator contract can call this func");
        }

        let mut service = self.get_service_by_id(service_id);
        let employer = service.actual_owner.clone();

        if service.actual_owner != applicant && employer != applicant {
            env::panic(b"Applicant dont found");
        }

        if service.creator_id != accused && employer != accused {
            env::panic(b"Accused dont found");
        }

        service.on_dispute = true;
        self.service_by_id.insert(&service.id, &service);
        return self.get_random_users_account_by_role_jugde(jugdes, exclude);
    }

    /// Callback para verificar bloqueo de tokens en contrato ft
    /// 
    pub fn on_block_tokens(&mut self, service_id: u64, owner_id: AccountId, buyer: AccountId) {
        if env::predecessor_account_id() != env::current_account_id() {
            env::panic(b"Only the contract can call its function")
        }
        assert_eq!(
            env::promise_results_count(),
            1,
            "Contract expected a result on the callback"
        );
        match env::promise_result(0) {
            PromiseResult::Successful(data) => {
                let balance = near_sdk::serde_json::from_slice::<Balance>(&data);
                if balance.is_ok() {
                    env::log(format!("Se bloqueo {:?} tokens de 1", balance).as_bytes());
                    
                    // Quitarle el servicio al owner
                    self.delete_service(&service_id, &owner_id);

                    // Anadirle el servicio al comprador
                    self.add_service(&service_id, &buyer);

                    let mut service = self.get_service_by_id(service_id.clone());
                    // Modificar la metadata del service
                    service.actual_owner = buyer.clone();
                    service.employers_account_ids.insert(buyer.clone());
                    self.service_by_id.insert(&service_id, &service);

                    // if let Some(memo) = memo {
                        //     env::log(format!("Memo: {}", memo).as_bytes());
                    // }
                } else {
                    env::panic(b"ERR_WRONG_VAL_RECEIVED")
                }
            },
            PromiseResult::Failed => env::panic(b"on_block_tokens callback faild"),
            PromiseResult::NotReady => env::panic(b"on_block_tokens callback faild"),
        };
    }

    /*** INTERNAL FUNCTIONS  ***/


    #[private]
    fn get_users(&self, from_index: u64, limit: u64) -> Vec<(AccountId, User)> {
        let keys = self.users.keys_as_vector();
        let values = self.users.values_as_vector();
        (from_index..std::cmp::min(from_index + limit, self.users.len()))
            .map(|index| (keys.get(index).unwrap(), values.get(index).unwrap()))
            .collect()
    }

    #[private]
    fn add_service(&mut self, service_id: &u64, account_id: &String) {
        let mut services_set = self
            .services_by_account
            .get(account_id)
            .unwrap_or_else(|| UnorderedSet::new(unique_prefix(&account_id)));
        services_set.insert(service_id);
        self.services_by_account.insert(account_id, &services_set);
    }

    #[private]
    fn delete_service(&mut self, service_id: &u64, account_id: &String) {
        let mut services_set = expect_value_found(self.services_by_account.get(account_id), "Service should be owned by the sender".as_bytes());
        services_set.remove(service_id);
        self.services_by_account.insert(&account_id, &services_set);
    }

    #[allow(unused_variables)]
    // #[private] near call $MA_ID get_random_users_account_by_role_jugde '{}' --account
    pub fn get_random_users_account_by_role_jugde(&self, amount: u8, exclude: Vec<ValidAccountId>) -> Vec<AccountId> {
        if amount > 10 {
            env::panic(b"No se puede pedir mas de 10");
        }
        
        let users = self.get_users_by_role(UserRoles::Jugde, 0, (amount as u64) + 1);
        if amount as usize > users.len() {
            env::panic(b"La cantidad pedida es mayor a la existente");
        }
        
        let mut sample: Vec<AccountId> = Vec::new();
        let seed = env::random_seed();
        for i in 0..users.len() {
            let m = (users.len() - 1 + 1);
            let rn = 1 + ((*seed.get(i).unwrap() as usize) % m) as usize;
            sample.push(users[rn - 1].account_id.clone());
            env::log(format!("{:?}", rn).as_bytes());
        }

        // return users.iter().map(|x| x.account_id.clone()).collect();


        return sample;
    }

    #[private]
    fn measure_min_service_storage_cost(&mut self) {
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

    #[private]
    fn update_user_mints(&mut self, quantity: u16) -> User {
        let sender = env::predecessor_account_id();
        let mut user = expect_value_found(self.users.get(&sender), "Before mint a nft, create an user".as_bytes());
        
        if user.mints + quantity > USER_MINT_LIMIT {
            env::panic(format!("Exceeded user mint limit {}", USER_MINT_LIMIT).as_bytes());
        }
        user.mints += quantity;

        self.users.insert(&sender, &user);

        return user
    }


    /*** ASSERTS  ***/

    /// Verificar que sea el admin
    #[private]
    fn assert_admin(&self, account_id: &AccountId) {
        if *account_id != self.contract_owner {
            env::panic("Must be owner_id how call its function".as_bytes())
        }
    }

    #[private]
    fn assert_service_exists(&self, service_id: &u64) {
        if *service_id > self.total_services {
            env::panic(b"The indicated service doesn't exist")
        }
    }

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

#[ext_contract(ext_token)]
pub trait Token {
    fn mint(receiver: ValidAccountId, quantity: U128);
    fn transfer_tokens(to: AccountId, amount: Balance);
    fn block_tokens(amount: Balance);
}
#[ext_contract(ext_self)]
pub trait ExtSelf {
    fn on_mint(applicant: AccountId, accused: AccountId, service_id: u64, proves: String);
    fn on_transfer_tokens(service_id: u64);
    fn on_block_tokens(service_id: u64);
}

// Posibles errores que se usan posteriormente como Panic error
/*
#[derive(Serialize, Deserialize, PanicMessage)]
#[serde(crate = "near_sdk::serde", tag = "err")]
pub enum Panic {
    #[panic_msg = "Invalid argument for service title `{}`: {}"]
    InvalidTitle { len_title: usize, reason: String },

    #[panic_msg = "Invalid argument for service description `{}`: {}"]
    InvalidDescription { len_description: usize, reason: String },

    #[panic_msg = "Service ID must have a positive quantity and less than 10"]
    InvalidMintAmount { },

    #[panic_msg = "Service ID `{:?}` was not found"]
    ServiceIdNotFound { service_id: u64 },

    #[panic_msg = "Operation is allowed only for admin"]
    AdminRestrictedOperation,
    #[panic_msg = "Unable to delete Account ID `{}`"]
    NotAuthorized { account_id: AccountId },
    
    #[panic_msg = "Service ID `{:?}` does not belong to account `{}`"]
    ServiceIdNotOwnedBy { service_id: u64, owner_id: AccountId },
    #[panic_msg = "Sender `{}` is not authorized to make transfer"]
    SenderNotAuthToTransfer { sender_id: AccountId },
    #[panic_msg = "The service owner and the receiver should be different"]
    ReceiverIsOwner,
}
*/

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use near_sdk::MockedBlockchain;
//     use near_sdk::test_utils::{VMContextBuilder, accounts};
//     use near_sdk::{testing_env, VMContext};

//     fn get_context(is_view: bool) -> VMContext {
//         VMContextBuilder::new()
//             .signer_account_id(accounts(1))
//             .predecessor_account_id(accounts(2))
//             .attached_deposit(100000000000000000)
//             .is_view(is_view)
//             .build()
//     }

//     #[test]
//     fn test_basic() {
//         let admin_id = string_to_valid_account_id(&accounts(1).to_string());
//         let mut context = get_context(false);
//         context.attached_deposit = 58700000000000000000000;
//         testing_env!(context.clone());
//         let marketplace = Marketplace::new(admin_id.clone(), string_to_valid_account_id(&"pepe.near".to_string()));

//         let admin: User = marketplace.get_user(admin_id.clone());

//         // Verificar que el admin sea creado correctamente
//         assert_eq!(
//             (admin.mints == false) &&
//             (admin.account_id == admin_id.to_string()) &&
//             (admin.roles.get(&UserRoles::Admin).is_some()) &&
//             (marketplace.get_user_services_id(admin_id).len() == 0) // no minteo ningun service
//             ,
//             true
//         );
//     }
//     #[test]

//     fn test_mint() {
//         let mut context = get_context(false);
//         let admin_id = string_to_valid_account_id(&accounts(1).to_string());
//         context.attached_deposit = 58700000000000000000000;
//         context.predecessor_account_id = accounts(1).to_string();
//         testing_env!(context);
//         let mut marketplace = Marketplace::new(admin_id.clone(), string_to_valid_account_id(&"pepe.near".to_string()));

//         let jose_service = marketplace.mint_service(ServiceMetadata {
//             fullname: "Jose Antoio".to_string(),
//             profile_photo_url: "Jose_Antoio.png".to_string(),
//             price: 10,
//             on_sale: false,
//         });

//         let admin: User = marketplace.get_user(admin_id.clone());
//         let on_sales_services = marketplace.get_user_services(admin_id, true);

//         assert_eq!(
//             (admin.roles.get(&UserRoles::Admin).is_some()) &&
//             on_sales_services.len() == 3 &&
//             admin.mints == true
//             ,
//             true
//         );  

//         // let user2 = marketplace.add_user(
//         //     "maria.testnet".to_string(),
//         //     UserRoles::Professional, vec!(category2, category3)
//         // );
//         // context.attached_deposit = 58700000000000000000000;
//         // testing_env!(context);
//         // marketplace.mint_service(ServiceMetadata {
//         //     fullname: "Maria Jose".to_string(),
//         //     profile_photo_url: "Maria_Jose.png".to_string(),
//         //     price: 10,
//         //     on_sale: true,
//         // }, 3);

//         // let user3 = marketplace.add_user(
//         //     "ed.testnet".to_string(),
//         //     UserRoles::Professional, vec!(category4)
//         // );
//         // context.attached_deposit = 58700000000000000000000;
//         // testing_env!(context);
//         // marketplace.mint_service(ServiceMetadata {
//         //     fullname: "Ed Robet".to_string(),
//         //     profile_photo_url: "Ed_Robet.png".to_string(),
//         //     price: 10,
//         //     on_sale: true,
//         // }, 1);
//     }

//     // #[test]
//     // fn test_user() {
//     //     let mut context = get_context(false);
//     //     let admin_id = accounts(1).to_string();
//     //     context.attached_deposit = 58700000000000000000000;
//     //     context.predecessor_account_id = admin_id.clone();
//     //     testing_env!(context);
//     //     let mut marketplace = Marketplace::new(admin_id.clone());

//     //     // let mut context = get_context(false);
//     //     // context.attached_deposit = 58700000000000000000000;
//     //     // context.predecessor_account_id = accounts(2).to_string();
//     //     // testing_env!(context);

//     //     let user_id = "andres.testnet";
//     //     marketplace.add_user(
//     //         user_id.to_string(),
//     //         UserRoles::Professional,
//     //         vec!(generate_category1())
//     //     );

//     //     assert_eq!(
//     //         true,
//     //         true
//     //     );
//     // }

//     #[test]
//     fn test_roles() {

//     }

//     #[test]
//     fn test_categories() {

//     }
// }