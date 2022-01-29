use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, UnorderedSet};
use near_sdk::json_types::{ValidAccountId, U128};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json;
use near_sdk::{env, near_bindgen, AccountId, Balance, PanicOnDefault, Promise, StorageUsage, 
    ext_contract, Gas, PromiseResult};
use std::collections::{HashSet};
use std::convert::TryFrom;
// use near_env::PanicMessage;

use crate::internal::*;
use crate::user::*;
mod internal;
mod user;

mod event;
pub use event::NearEvent;

near_sdk::setup_alloc!();

const NO_DEPOSIT: Balance = 0;
const BASE_GAS: Gas = 30_000_000_000_000;
const USER_MINT_LIMIT: u16 = 100;
const ONE_DAY: u64 = 86400000000000;
// const GAS_FOR_FT_TRANSFER: Gas = 5_000_000_000_000;
// const ON_CALLBACK_GAS: u64 = 20_000_000_000_000; 

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Service {
    pub id: u64,
    pub metadata: ServiceMetadata,
    pub creator_id: AccountId,
    pub actual_owner: AccountId,
    pub employers_account_ids: HashSet<AccountId>,
    // Dias que va a durar el trabajo ofrecido 
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
    pub categories: String
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Marketplace {
    pub service_by_id: UnorderedMap<u64, Service>,
    // Servicios de cada usuario.
    pub services_by_account: LookupMap<AccountId, UnorderedSet<u64>>,
    pub total_services: u64,
    // Usuarios del marketplace.
    pub users: UnorderedMap<AccountId, User>,
    pub contract_owner: AccountId,
    pub contract_me: AccountId,
    pub contract_ft: AccountId,
    // Storage en bytes por cada cuenta.
    pub extra_storage_in_bytes_per_service: StorageUsage,
}

#[near_bindgen]
impl Marketplace {
    /// Inicializa el contrato y asigna el owner. El cual sera el primer Admin.
    ///
    /// #Arguments
    /// * `owner_id`    - La cuenta de mainnet/testnet de quien sera el Owner del contrato.
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
        roles.push(UserRoles::Judge);
        this.add_user_p(roles.clone(), owner_id.into(), 
            "{
                \"legal_name\": \"Marketplace Contract\",
                \"education\": \"I'am a smart contract, I dont need school\",
                \"links\": [],
                \"bio\": \"I live inside of a smart contract in the NEAR protocol\",
                \"picture\": \"https://photo.png\",
                \"country\": \"NEARland\",
                \"email\": \"marketplace@nearmail.com\",
                \"idioms\": [{
                    \"idiom\": \"binary\",
                    \"level\": \"Native\"
                }]
            }".to_string());
        
        this.add_user_p(roles.clone(), mediator.into(), 
            "{
                \"legal_name\": \"Mediator Contract\",
                \"education\": \"I'am a smart contract, I dont need school\",
                \"links\": [],
                \"bio\": \"I live inside of a smart contract in the NEAR protocol\",
                \"picture\": \"https://photo.png\",
                \"country\": \"NEARland\",
                \"email\": \"mediator@nearmail.com\",
                \"idioms\": [{
                    \"idiom\": \"binary\",
                    \"level\": \"Native\"
                }]
            }".to_string());

        this.add_user_p(roles.clone(), ft.into(), 
            "{
                \"legal_name\": \"FT Contract\",
                \"education\": \"I'am a smart contract, I dont need school\",
                \"links\": [],
                \"bio\": \"I live inside of a smart contract in the NEAR protocol\",
                \"picture\": \"https://photo.png\",
                \"country\": \"NEARland\",
                \"email\": \"ft@nearmail.com\",
                \"idioms\": [{
                    \"idiom\": \"binary\",
                    \"level\": \"Native\"
                }]
            }".to_string());
            
        this.measure_min_service_storage_cost();
        return this;
    }
    

    /*******************************/
    /****** SERVICES FUNCTIONS *****/
    /*******************************/

    /// Mintea uno o varios servicios.
    /// Solo ejecutable por profesionales. 
    ///
    /// #Arguments
    /// * `metadata`    - La metadata que el profesional asigna a su servicio.
    /// * `quantity`    - La cantidad de services que se desea mintear.
    /// * `duration`    - Duracion en dias estimada para realizarse el servicio.
    #[payable]
    pub fn mint_service(&mut self, metadata: ServiceMetadata, quantity: u16, duration: u16) -> Service {
        let sender = env::predecessor_account_id();
        let user = self.update_user_mints(quantity); // Cantidad de servicios

        //Verificar que sea un profesional
        if !user.roles.get(&UserRoles::Professional).is_some() {
            env::panic(b"Only professionals can mint a service");
        }
        let initial_storage_usage = env::storage_usage();
        // env::log(format!("initial store usage: {}", initial_storage_usage).as_bytes());

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
                env::panic(b"Service already exists");
            }

            services_set.insert(&self.total_services);
            self.total_services += 1;
            service.id = self.total_services;

            NearEvent::log_service_mint(
                service.id.clone(),
                service.actual_owner.clone().to_string(),
                service.metadata.title.clone(),
                service.metadata.description.clone(),
                service.metadata.categories.clone(),
                service.metadata.price.clone(),
                service.duration.clone(),
            );
        }

        self.services_by_account.insert(&sender, &services_set);

        // Manejo de storage
        let new_services_size_in_bytes = env::storage_usage() - initial_storage_usage;
        // env::log(format!("New services size in bytes: {}", new_services_size_in_bytes).as_bytes());

        let required_storage_in_bytes = self.extra_storage_in_bytes_per_service + new_services_size_in_bytes;
        // env::log(format!("Required storage in bytes: {}", required_storage_in_bytes).as_bytes());

        deposit_refund(required_storage_in_bytes);

        // Retornar datos del servicio
        service
    }


    /// Adquisicion de un servicio.
    /// Solo ejecutable por empleadores.
    #[payable]
    pub fn buy_service(&mut self, service_id: u64) {
        // Verificar que el servicio exista
        self.assert_service_exists(&service_id);

        let mut service = self.get_service_by_id(service_id.clone());
        
        // Verificar que este en venta
        if !service.on_sale {
            env::panic(b"The indicated service is not on sale")
        }

        let sender = env::predecessor_account_id();
        let buyer = self.get_user(string_to_valid_account_id(&sender).clone());
        // Verificar que quien compra tenga rol de empleador.
        if buyer.roles.get(&UserRoles::Admin).is_none() && buyer.roles.get(&UserRoles::Employeer).is_none() {
            env::panic(b"Only employers can buy services");
        }
        // Verificar que no lo haya comprado ya.
        if buyer.account_id == service.actual_owner.clone() {
            env::panic(b"Already is the service owner");
        }
        
        // Realizar el pago en NEARs.
        if env::attached_deposit() >= service.metadata.price {
            Promise::new(self.contract_me.clone()).transfer(service.metadata.price);

            // Establecer como servicio vendido y no en venta.
            service.sold = true;
            service.on_sale = false;

            // Cambiar propiedad del servicio.
            service.actual_owner = sender.clone();
            self.delete_service(&service_id, &service.actual_owner);
            self.add_service(&service_id, &buyer.account_id);

            // Establecer tiempo de la compra.
            service.buy_moment = env::block_timestamp();

            self.service_by_id.insert(&service_id, &service);
        }
        else {
            // Realizar el pago en BJT tokens.
            let _res = ext_token::transfer_tokens(
                self.contract_me.clone(),
                service.metadata.price,
                &self.contract_ft, NO_DEPOSIT, BASE_GAS)
            .then(ext_self::on_buy_service(
                service_id,
                &env::current_account_id(), NO_DEPOSIT, BASE_GAS)
            );
        };

        NearEvent::log_service_buy(
            service.id.clone(),
            sender.clone().to_string()
        );
    }

    /// Callback luego de realizarse el pago que queda inicialmente bloqueado.
    /// 
    pub fn on_buy_service(&mut self, service_id: u64) -> Service {
        match env::promise_result(0) {
            PromiseResult::Successful(_data) => {
                let mut service = self.get_service_by_id(service_id.clone());
                let sender = env::predecessor_account_id();
                let buyer = self.get_user(string_to_valid_account_id(&sender).clone());

                // Establecer como servicio vendido y no en venta.
                service.sold = true;
                service.on_sale = false;

                // Cambiar propiedad del servicio.
                service.actual_owner = sender.clone();
                self.delete_service(&service_id, &service.actual_owner);
                self.add_service(&service_id, &buyer.account_id);

                // Establecer tiempo de la compra.
                service.buy_moment = env::block_timestamp();

                self.service_by_id.insert(&service_id, &service);

                return service;
            }
            PromiseResult::Failed => env::panic(b"Callback faild"),
            PromiseResult::NotReady => env::panic(b"Callback faild"),
        };
    }


    /// Crear disputa en el contrato mediador.
    /// Solo ejecutable por el empleador que compro el servicio.
    ///
    #[payable]
    pub fn reclaim_dispute(&mut self, service_id: u64, proves: String) {
        // Verificar que no haya sido banneado quien solicita la disputa.
        let user_id = string_to_valid_account_id(&env::predecessor_account_id());
        if self.get_user(user_id).banned == true {
            env::panic(b"You are already banned for fraudulent disputes");
        }
        // Verificar que el servicio exista.
        self.assert_service_exists(&service_id);

        let service = self.get_service_by_id(service_id.clone());

        // Verificar que efectivamente haya comprado el servicio.
        if service.actual_owner != env::signer_account_id() || service.actual_owner == service.creator_id {
            env::panic(b"Only the employeer that buy the service can init a dispute");
        }
        // Verificar que no este ya solicitada la disputa.
        if service.on_dispute == true {
            env::panic(b"Actually the service is in dispute");
        };

        let _res = ext_mediator::new_dispute(
            service_id,
            env::signer_account_id(),
            service.creator_id.clone(),
            proves,
            service.metadata.price.clone(),
            &self.contract_me,
            env::attached_deposit(),
            BASE_GAS,
        ).then(ext_self::on_new_dispute(
            service_id,
            &env::current_account_id(),
            NO_DEPOSIT,
            BASE_GAS,
        ));
    }

    /// Callback desde contrato mediador.
    /// 
    pub fn on_new_dispute(&mut self, service_id: u64) {
        if env::predecessor_account_id() != env::current_account_id() {
            env::panic(b"Only the contract can call its function")
        }
        assert_eq!(env::promise_results_count(), 1, "Contract expected a result on the callback");
        
        match env::promise_result(0) {
            PromiseResult::Successful(_data) => {
                let mut service = self.get_service_by_id(service_id.clone());

                service.on_dispute = true;
                self.service_by_id.insert(&service_id, &service);

                // NearEvent::log_dispute_new(
                    
                // );
            }
            PromiseResult::Failed => env::panic(b"Callback faild"),
            PromiseResult::NotReady => env::panic(b"Callback faild"),
        };
    }


    /// Retornar un servicio al creador.
    /// Solo ejecutable por el profesional creador del servicio una vez pasado el tiempo establecido.
    #[payable]
    pub fn reclaim_service(&mut self, service_id: u64) {
        // Verificar que el servicio exista.
        self.assert_service_exists(&service_id);

        let service = self.get_service_by_id(service_id.clone());

        // Verificar que haya pasado el tiempo establecido para poder hacer el reclamo.
        if env::block_timestamp() < service.buy_moment + ONE_DAY * (service.duration as u64 + 2) {
            env::panic("Insuficient time to reclame the service".as_bytes());
        }

        // Verificar que el empleador no haya solicitado una disputa.
        if service.on_dispute == true {
            env::panic(b"Actually the service is in dispute");
        }

        let sender_id = string_to_valid_account_id(&env::predecessor_account_id());
        env::log(sender_id.to_string().as_bytes());

        if service.creator_id != env::signer_account_id() {
            env::panic(b"Only the corresponding professional can reclaim the service");
        }

        let _res = ext_mediator::pay_service(
            env::signer_account_id(),
            service.metadata.price,
            &self.contract_me,
            NO_DEPOSIT,
            BASE_GAS,
        ).then(ext_self::on_return_service(
            service_id,
            &env::current_account_id(),
            NO_DEPOSIT,
            BASE_GAS,
        ));

        NearEvent::log_service_reclaim(
            service.id.clone(),
            sender_id.clone().to_string()
        );
    }

    /// Retornar un servicio al creador.
    /// Solo ejecutable por el profesional creador del servicio una vez pasado el tiempo establecido.
    #[payable]
    pub fn reclaim_service_test(&mut self, service_id: u64) {
        // Verificar que el servicio exista.
        self.assert_service_exists(&service_id);

        let service = self.get_service_by_id(service_id.clone());

        // Verificar que haya pasado el tiempo establecido para poder hacer el reclamo.
        // if env::block_timestamp() < service.buy_moment + ONE_DAY * (service.duration as u64 + 2) {
        //     env::panic("Insuficient time to reclame the service".as_bytes());
        // }

        // Verificar que el empleador no haya solicitado una disputa.
        if service.on_dispute == true {
            env::panic(b"Actually the service is in dispute");
        }

        let sender_id = string_to_valid_account_id(&env::predecessor_account_id());
        env::log(sender_id.to_string().as_bytes());

        if service.creator_id != env::signer_account_id() {
            env::panic(b"Only the corresponding professional can reclaim the service");
        }

        let _res = ext_mediator::pay_service(
            env::signer_account_id(),
            service.metadata.price,
            &self.contract_me,
            NO_DEPOSIT,
            BASE_GAS,
        ).then(ext_self::on_return_service(
            service_id,
            &env::current_account_id(),
            NO_DEPOSIT,
            BASE_GAS,
        ));
    }


    /// Retornar un servicio al creador.
    /// Ejecutable solo por el admin, previa aprobacion de ambas partes.
    /// 
    pub fn return_service_by_admin(&mut self, service_id: u64) {
        // Verificar que el servicio exista.
        self.assert_service_exists(&service_id);

        let service = self.get_service_by_id(service_id.clone());

        let sender_id = string_to_valid_account_id(&env::predecessor_account_id());
        env::log(sender_id.to_string().as_bytes());
        let sender = self.get_user(sender_id.clone());
        if sender.roles.get(&UserRoles::Admin).is_none()  {
            env::panic("Only admins can give back the services".as_bytes());
        }

        let _res = ext_mediator::pay_service(
            env::signer_account_id(),
            service.metadata.price,
            &self.contract_me,
            NO_DEPOSIT,
            BASE_GAS,
        ).then(ext_self::on_return_service(
            service_id,
            &env::current_account_id(),
            NO_DEPOSIT,
            BASE_GAS,
        ));

        NearEvent::log_service_return(
            service.id.clone(),
            service.creator_id.clone().to_string()
        );
    }


    /// Callback por reclamo de un servicio por parte del profesional.
    /// 
    pub fn on_return_service(&mut self, service_id: u64) -> Service {
        if env::predecessor_account_id() != env::current_account_id() {
            env::panic(b"Only the contract can call its function")
        }
        assert_eq!(env::promise_results_count(), 1, "Contract expected a result on the callback");
        
        match env::promise_result(0) {
            PromiseResult::Successful(_data) => {
                let mut service = self.get_service_by_id(service_id.clone());

                self.delete_service(&service_id, &service.actual_owner);
                self.add_service(&service_id, &service.creator_id);

                // Modificar los datos del servicio.
                service.actual_owner = service.creator_id.clone();
                service.on_sale = true;
                service.buy_moment = 0;
                service.sold = false;
                self.service_by_id.insert(&service_id, &service);

                return service;
            }
            PromiseResult::Failed => env::panic(b"Callback faild"),
            PromiseResult::NotReady => env::panic(b"Callback faild"),
        };
    }
    
    /// Modificar la metadata de un servicio.
    /// Solo ejecutable por el profesional si es que lo posee.
    ///
    #[payable]
    pub fn update_service(&mut self, service_id: u64, metadata: ServiceMetadata, duration: u16) -> Service {
        let initial_storage_usage = env::storage_usage();
        env::log(format!("initial store usage: {}", initial_storage_usage).as_bytes());

        // Verificar que el servicio exista.
        self.assert_service_exists(&service_id);

        let mut service = self.get_service_by_id(service_id.clone());

        // Verificar que no este ya comprado.
        if service.sold == true {
            env::panic(b"You can't modify while the service is in hands of the employer")
        }

        // Verificar que sea el creador quien ejecuta la funcion.
        let sender_id = string_to_valid_account_id(&env::predecessor_account_id());
        let sender = self.get_user(sender_id.clone());
        let owner = service.creator_id.clone();
        let owner_id = string_to_valid_account_id(&owner);
        if (sender_id != owner_id) && sender.roles.get(&UserRoles::Admin).is_none() {
            env::panic("Only the creator or Admins can change metadata services".as_bytes());
        }

        // Insertar nueva metadata.
        service.metadata = metadata;
        service.duration = duration;

        self.service_by_id.insert(&service_id, &service);

        if initial_storage_usage <  env::storage_usage() {
            let new_services_size_in_bytes = env::storage_usage() - initial_storage_usage;
            env::log(format!("New size in bytes: {}", new_services_size_in_bytes).as_bytes());
            
            let required_storage_in_bytes = self.extra_storage_in_bytes_per_service + new_services_size_in_bytes;
            env::log(format!("Required storage in bytes: {}", required_storage_in_bytes).as_bytes());
            deposit_refund_to(required_storage_in_bytes, env::predecessor_account_id());
        }
        
        service
    }


    /// Cambiar el estado de un servicio segun este en venta o no.
    /// Solo para el profesional o administradores.
    /// 
    pub fn update_service_on_sale(&mut self, service_id: u64, on_sale: bool) -> Service {
        // Verificar que el servicio exista.
        self.assert_service_exists(&service_id);

        let mut service = self.get_service_by_id(service_id.clone());
        let sender = env::predecessor_account_id();
        let user = self.get_user(string_to_valid_account_id(&sender));

        let is_creator = service.creator_id == sender;

        // Verificar que sea el cleador.
        if !user.roles.get(&UserRoles::Admin).is_some() && !is_creator {
            env::panic("Only the owner or admin can desactivate or activate the service".as_bytes());
        }

        // Verificar que no este ya comprado.
        if service.sold == true {
            env::panic(b"You can't modify while the service is in hands of the employer")
        }

        service.on_sale = on_sale;
        self.service_by_id.insert(&service_id, &service);

        NearEvent::log_service_update_on_sale(
            service_id.clone(),
            on_sale.clone()
        );

        service
    }


    /*******************************/
    /******** USERS FUNCTIONS ******/
    /*******************************/

    /// Registra usuarios, asignando su rol y a que se dedican por categorias.
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet de quien sera registrado.
    /// * `role`        - El role que tendra el usuario. Solo los admin puenden decir quien es moderador.
    /// * `category`    - La categoria en la cual el usuario puede decir a que se dedica.
    #[payable]
    pub fn add_user(&mut self, roles: Vec<UserRoles>, personal_data: Option<String>) -> User {
        let initial_storage_usage = env::storage_usage();
        env::log(format!("initial store usage: {}", initial_storage_usage).as_bytes());

        let account_id: AccountId = env::predecessor_account_id();

        if personal_data.is_some()
        {
            // solo vereficar los nombre del json
            let _p: PersonalData = serde_json::from_str(personal_data.as_ref().unwrap()).unwrap();
        }
        
        let services_set = UnorderedSet::new(unique_prefix(&account_id));

        self.services_by_account.insert(&account_id, &services_set);


        let mut new_user = User{
            account_id: account_id.clone(),
            mints: 0,
            roles: HashSet::new(),
            reputation: 0,
            personal_data: personal_data, 
            banned: false,
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

        // NearEvent::log_user_new(
        //     account_id.clone(),
        //     on_sale.clone()
        // );

        new_user
    }

    fn add_user_p(&mut self, roles: Vec<UserRoles>, account_id: AccountId, data: String) -> User {
        // solo vereficar los nombre del json
        let _p: PersonalData = serde_json::from_str(&data).unwrap();


        let services_set = UnorderedSet::new(unique_prefix(&account_id));
        self.services_by_account.insert(&account_id, &services_set);

        let initial_storage_usage = env::storage_usage();
        env::log(format!("initial store usage: {}", initial_storage_usage).as_bytes());

        let mut new_user = User{
            account_id: account_id.clone(),
            mints: 0,
            roles: HashSet::new(),
            reputation: 3,
            personal_data: Some(data),
            banned: false,
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

    /// Eliminar un usuario.
    /// Solo ejecutable por el admin.
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet de quien sera registrado.
    pub fn remove_user(&mut self, account_id: ValidAccountId) {
        self.assert_admin(&env::predecessor_account_id());
        
        let user = self.get_user(account_id.clone());

        self.services_by_account.remove(&user.account_id);
        self.users.remove(&account_id.into());
    }

    /// Reescribe las categorias del usuario.
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet de quien sera registrado.
    /// * `category`    - La categoria en la cual el usuario puede decir a que se dedica.
    #[payable]
    pub fn update_user_data(&mut self, roles: Vec<UserRoles>, data: String) -> User {
        let initial_storage_usage = env::storage_usage();
        env::log(format!("Initial store usage: {}", initial_storage_usage).as_bytes());
        
        // solo vereficar los nombre del json
        let _p: PersonalData = serde_json::from_str(&data).unwrap();
        
        let account_id: AccountId = env::predecessor_account_id();
        let mut user = self.get_user(string_to_valid_account_id(&account_id));
        
        if account_id.to_string() != user.account_id {
            env::panic(b"Only the user cant modify it self");
        }
        
        user.personal_data = Some(data);

        for r in roles.iter() {
            user.roles.insert(*r);
        }

        self.users.insert(&account_id.clone(), &user);

        env::log(format!("secun store usage: {}", env::storage_usage()).as_bytes());
        if initial_storage_usage <  env::storage_usage() {
            let new_services_size_in_bytes = env::storage_usage() - initial_storage_usage;
            env::log(format!("New size in bytes: {}", new_services_size_in_bytes).as_bytes());

            let required_storage_in_bytes = self.extra_storage_in_bytes_per_service + new_services_size_in_bytes;
            env::log(format!("Required storage in bytes: {}", required_storage_in_bytes).as_bytes());
            deposit_refund_to(required_storage_in_bytes, account_id);
        }

        return user;
    }

    /// Agregar o quitar un rol al usuario.
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet de quien sera registrado.
    /// * `role`        - El role que tendra el usuario. Solo los admin puenden decir quien es moderador.
    #[payable]
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
    
    /*******************************/
    /******* GET FUNCTIONS  ********/
    /*******************************/

    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet del usuario.
    pub fn get_user(&self, account_id: ValidAccountId) -> User {
        expect_value_found(self.users.get(&account_id.into()), "No users found. Register the user first".as_bytes())
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
        return expect_value_found(self.service_by_id.get(&service_id.into()), "No users found. Register the user first".as_bytes());
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

    /*******************************/
    /****** CALLBACK FUNCTIONS *****/
    /*******************************/

    /// Verificar datos de usuario desde mediator
    /// 
    pub fn validate_user(&self, account_id: AccountId) -> bool {
        let user_id = string_to_valid_account_id(&account_id);
        let user = self.get_user(user_id);

        if !user.roles.get(&UserRoles::Judge).is_some() {
            env::panic(b"Is required have a Judge status to can vote");
        }
        if user.reputation < 3 {
            env::panic(b"Your reputation isn't sufficient");
        }
        
        true
    }

    /// Callback para retornar un servicio al creador.
    /// Ejecutable solo el contrator mediador una vez finalizada la disputa.
    /// 
    pub fn return_service_by_mediator(&mut self, service_id: &u64) -> Service {
        let mut service = self.get_service_by_id(service_id.clone());

        // Verificar que sea el contrator mediador quien ejecuta
        let sender_id = env::predecessor_account_id();
        if sender_id != self.contract_me  {
            env::panic(b"Only mediator contract can execute this function");
        }

        self.delete_service(&service_id, &service.actual_owner);
        self.add_service(&service_id, &service.creator_id);

        // Modificar la metadata del servicio
        service.actual_owner = service.creator_id.clone();
        service.on_sale = true;
        service.buy_moment = 0;
        service.on_dispute = false;
        self.service_by_id.insert(&service_id, &service);

        service
    }

    /// Banear un usuario ante fraude en una disputa
    /// Solo ejecutable por Admins del contrato mediadot
    /// 
    pub fn ban_user_by_mediator(&mut self, user_id: AccountId) -> User {
        // Verificar que sea el contrator mediador quien ejecuta
        if env::predecessor_account_id() != self.contract_me  {
            env::panic(b"Only mediator contract can execute this function");
        }

        let user_id = string_to_valid_account_id(&user_id);
        let mut user = self.get_user(user_id);

        user.banned = true;

        user
    }

    /******************************/
    /***** INTERNAL FUNCTIONS  ****/
    /******************************/

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
        let mut user = expect_value_found(self.users.get(&sender), "Before mint a service, create an user".as_bytes());
        
        if user.mints + quantity > USER_MINT_LIMIT {
            env::panic(format!("Exceeded user mint limit {}", USER_MINT_LIMIT).as_bytes());
        }
        user.mints += quantity;

        self.users.insert(&sender, &user);

        return user
    }

    /**************************/
    /******** ASSERTS  ********/
    /**************************/

    /// Verificar que sea el admin.
    #[private]
    fn assert_admin(&self, account_id: &AccountId) {
        if *account_id != self.contract_owner {
            env::panic("Must be owner_id how call its function".as_bytes())
        }
    }

    /// Verificar que el servicio exista.
    #[private]
    fn assert_service_exists(&self, service_id: &u64) {
        if *service_id > self.total_services {
            env::panic(b"The indicated service doesn't exist")
        }
    }
}

#[ext_contract(ext_token)]
pub trait Token {
    fn mint(receiver: ValidAccountId, quantity: U128);
    fn transfer_tokens(to: AccountId, amount: Balance);
}
#[ext_contract(ext_mediator)]
pub trait Mediator {
    fn new_dispute(service_id: u64, applicant: AccountId, accused: AccountId, proves: String, price: u128);
    fn pay_service(beneficiary: AccountId, amount: Balance) -> Balance;
}
#[ext_contract(ext_self)]
pub trait ExtSelf {
    fn on_new_dispute(service_id: u64);
    fn on_transfer_tokens(service_id: u64);
    fn on_buy_service(service_id: u64);
    fn on_return_service(service_id: u64);
}

/// Internal function to Option values
fn expect_value_found<T>(option: Option<T>, message: &[u8]) -> T {
    option.unwrap_or_else(|| env::panic(message))
}
