use std::collections::HashSet;

use near_env::PanicMessage;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, UnorderedSet};
use near_sdk::json_types::{ValidAccountId};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, Balance, PanicOnDefault, Promise, StorageUsage};

use crate::internal::*;
pub use crate::nft_core::*;
use crate::user::*;
use crate::categories::*;

mod internal;
mod nft_core;
mod user;
mod categories;

#[global_allocator]
static ALLOC: near_sdk::wee_alloc::WeeAlloc<'_> = near_sdk::wee_alloc::WeeAlloc::INIT;

// const ON_CALLBACK_GAS: u64 = 20_000_000_000_000;
// const GAS_FOR_RESOLVE_TRANSFER: Gas = 10_000_000_000_000;
// const GAS_FOR_NFT_TRANSFER_CALL: Gas = 25_000_000_000_000 + GAS_FOR_RESOLVE_TRANSFER;
// const NO_DEPOSIT: Balance = 0;
// const MAX_MARKET_DEPOSIT: u128 = 100_000_000_000_000_000_000_000;
// const ACCESS_KEY_ALLOWANCE: u128 = 100_000_000_000_000_000_000_000;
// const SPONSOR_FEE: u128 = 100_000_000_000_000_000_000_000;
const USER_MINT_LIMIT: u8 = 20;
const USERS_LIMIT: u16 = u16::MAX;

pub type TokenId = String;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Token {
    pub owner_id: AccountId,
    pub metadata: TokenMetadata,
    pub approved_account_ids: HashSet<AccountId>,
    pub approval_id: u64,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct TokenMetadata {
    pub fullname: String,
    pub profile_photo_url: String,
    pub price: u16,
    pub linkedin: Option<String>,
    pub github: Option<String>,
    pub education: Option<String>
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub tokens_id_counter: u128,
    pub tokens_per_owner: LookupMap<AccountId, UnorderedSet<TokenId>>,
    pub tokens_by_id: UnorderedMap<TokenId, Token>,
    pub owner_id: AccountId,
    // The storage size in bytes for one account.
    pub extra_storage_in_bytes_per_token: StorageUsage,

    pub users: UnorderedMap<AccountId, User>,
}

#[near_bindgen]
impl Contract {
    /// Inicializa el contrato y asigna el propietario del contrato. El cual sera el primer admin
    ///
    /// #Arguments
    /// * `owner_id`    - La cuenta de mainnet/testnet de quien sera el owner del contrato.
    #[init]
    pub fn new(owner_id: ValidAccountId) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        let mut this = Self {
            tokens_id_counter: 0,
            tokens_per_owner: LookupMap::new(b"a".to_vec()),
            tokens_by_id: UnorderedMap::new(b"t".to_vec()),
            users: UnorderedMap::new(b"u".to_vec()),
            owner_id: owner_id.clone().into(),
            extra_storage_in_bytes_per_token: 0,
        };

        // El owner del contrato debe ser un usuario con role de Admin
        let mut lenguages = HashSet::new();
        lenguages.insert(ProgramingLenguages::Rust);

        let mut areas = HashSet::new();
        areas.insert(ProgrammerAreas::Blockchain);
        areas.insert(ProgrammerAreas::Backend);

        this.add_user(owner_id, UserRoles::Admin, Categories::Programmer(
            ProgrammerCategoryData {
                lenguages: lenguages,
                area: areas,
            }));

        this.measure_min_token_storage_cost();
        return this;
    }
    
    /// Mintea un o varios servios de un usuario que sea un profesional (tambien si eres un admin)
    ///
    /// #Arguments
    /// * `metadata`    - La metadata que el profesional asigna a su servicio.
    /// * `amount`      - La cantidad de tokens que se desea mintear.
    #[payable]
    pub fn nft_mint_service(&mut self, metadata: TokenMetadata, amount: u8) -> Token {

        let user = self.update_user_mint_amount(amount); // cantidad de servicios
        let owner_id = user.account_id;

        let is_professional = user.roles.get(&UserRoles::Professional).is_none();
        let is_admin = user.roles.get(&UserRoles::Admin).is_none();
        assert_eq!(is_professional || is_admin, true, "Solo los profesionales pueden mintear un nft");
        // if  {
        //     env::panic(b"Solo los profesionales pueden mintear un nft");
        // }

        let initial_storage_usage = env::storage_usage();
        env::log(format!("initial store usage: {}", initial_storage_usage).as_bytes());

        let token = Token {
            owner_id: owner_id.clone(),
            metadata: metadata,
            approved_account_ids: Default::default(),
            approval_id: 0,
        };
        for _i in 0 .. amount {
            assert!(
                self.tokens_by_id.insert(&self.tokens_id_counter.to_string(), &token).is_none(),
                "Token already exists"
            );
            self.internal_add_token_to_owner(&token.owner_id, &self.tokens_id_counter.to_string());
            self.tokens_id_counter += 1;
        }

        let new_tokens_size_in_bytes = env::storage_usage() - initial_storage_usage;
        env::log(format!("New tokens size in bytes: {}", new_tokens_size_in_bytes).as_bytes());

        let required_storage_in_bytes = self.extra_storage_in_bytes_per_token + new_tokens_size_in_bytes;
        env::log(format!("Required storage in bytes: {}", required_storage_in_bytes).as_bytes());

        deposit_refund(required_storage_in_bytes);

        return token;
    }

    /// Registra usuarios! Asignandoles un role y a que se didican por categorias
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet de quien sera registrado.
    /// * `role`        - El role que tendra el usuario. Solo los admin puenden decir quien es moderador.
    /// * `category`    - La categoria en la cual el usuario puede decir a que se dedica.
    pub fn add_user(&mut self, account_id: ValidAccountId, role: UserRoles, category: Categories) -> User {
        self.assert_owner(&env::predecessor_account_id());

        let s_account_id: AccountId = account_id.into();
        let tokens_set = UnorderedSet::new(unique_prefix(&s_account_id));
        self.tokens_per_owner.insert(&s_account_id, &tokens_set);

        let mut new_user = User{
            account_id: s_account_id.clone(),
            mints: 0,
            roles: HashSet::new(),
            rep: 0,
            categories: Vec::new()
        };
        new_user.categories.push(category);
        new_user.roles.insert(role);

        if self.users.insert(&s_account_id, &new_user).is_some() {
            env::panic(b"User account already added");
        }

        return new_user;
    }

    /// Elimina un usuarios y sus tokens
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet de quien sera registrado.
    // pub fn remove_user(&mut self, account_id: ValidAccountId) {
    //     assert_eq!(env::predecessor_account_id(), self.owner_id, "must be owner_id");
    //     let guest = self.users.get(&account_id.clone().into()).expect("Could not find the user");
    //     // TODO transfer NFTs
    //     self.tokens_per_owner.remove(&guest.account_id);
    //     self.users.remove(&account_id.into());

    // }

    /// Reescribe las categorias del usuario
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet de quien sera registrado.
    /// * `category`    - La categoria en la cual el usuario puede decir a que se dedica.
    pub fn user_update_categories(&mut self, account_id: ValidAccountId, category: Categories) -> User {
        if env::predecessor_account_id() == account_id.to_string() {
            env::panic(b"Only the user cant modify it self");
        }

        let mut user = self.get_user(account_id.clone());

        // por ahora solo soporta una sola categoria, por lo que no crece y siempre sera 0
        user.categories[0] = category;
        self.users.insert(&account_id.into(), &user);

        return user;
    }

    /// Agrega un role mas al usuario
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet de quien sera registrado.
    /// * `role`        - El role que tendra el usuario. Solo los admin puenden decir quien es moderador.
    pub fn user_add_role(&mut self, account_id: ValidAccountId, role: UserRoles) -> User {
        let is_user_sender = env::predecessor_account_id() != account_id.to_string();
        let is_owner_sender = env::predecessor_account_id() != self.owner_id;
        if is_user_sender && is_owner_sender {
            env::panic(b"Only the user and admins cant modify it self");
        }

        if is_owner_sender && (role as u8 > 1) {
            env::panic(b"Only the admins cant grant the admin or mod role");
        }

        let mut user = self.get_user(account_id.clone());

        user.roles.insert(role);
        self.users.insert(&account_id.into(), &user);
        
        return user;
    }

    /// Elimina un role mas al usuario
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet de quien sera registrado.
    /// * `role`        - El role que tendra el usuario. Solo los admin puenden decir quien es moderador.
    pub fn user_remove_role(&mut self, account_id: ValidAccountId, role: UserRoles) -> User {
        let mut user = self.get_user(account_id.clone());

        if user.roles.len() == 1 {
            env::panic(b"You most have more than one role at least to perfomace this");
        }

        user.roles.remove(&role);
        self.users.insert(&account_id.into(), &user);

        return user;
    }

    /// 
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet del usuario.
    pub fn get_user(&self, account_id: ValidAccountId) -> User {
        self.users.get(&account_id.into()).expect("No users found. Register the user first")
    }

    /// Obtener los token y sus metadata de un usuario
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet del usuario.
    pub fn get_user_tokens(&self, account_id: ValidAccountId) -> Vec<Token> {
        let mut tokens: Vec<Token> = Vec::new();
        let tokens_id = self.get_user_tokens_id(account_id.clone());
        for i in 0 .. tokens_id.len() {
            let token = self.tokens_by_id.get(&tokens_id[i]).expect("Token id dont match");
            tokens.push( token );
        }
        return tokens;
    }

    /// Obtener id de los tokens de un usuario
    ///
    /// #Arguments
    /// * `account_id`  - La cuenta de mainnet/testnet del usuario.
    pub fn get_user_tokens_id(&self, account_id: ValidAccountId) -> Vec<String> {
        return self.tokens_per_owner.get(&account_id.into()).expect("No users found or dont have any token").to_vec();
    }

    /// Filtra los usuarios por las categorias seleccionadas
    ///
    /// #Arguments
    /// * `category`    - La categoria en la cual los usuarios van a ser filtrados
    pub fn get_users_by_category(&self, category: Categories) -> Vec<User> {
        let mut users: Vec<User> = Vec::new();

        let mut programmer_data: Option<ProgrammerCategoryData> = None;
        let mut artist_data: Option<ArtistCategoryData> = None;
        match category {
            Categories::Programmer(data) => {
                programmer_data = Some(data);
            }
            Categories::Artist(data) => {
                artist_data= Some(data);
            }
        }

        for (account_id, user) in self.users.iter() {
            for category in user.categories.iter() {
                match category {
                    Categories::Programmer(data) => {
                        if programmer_data.is_some() {
                            let looking_data = programmer_data.as_ref().unwrap();
                            let mut found_lenguages = false;
                            let mut found_area = false;
                            if looking_data.lenguages.len() > 0 && !found_lenguages{
                                // let mut matchs = 0; // strict modes
                                for l in data.lenguages.iter() {
                                    if looking_data.lenguages.get(l).is_some() {
                                        // env::log(format!("LEN: {:?}", user).as_bytes());
                                        found_lenguages = true;
                                        break;
                                    }
                                }
                            }
                            if looking_data.area.len() > 0 && !found_area{
                                for a in data.area.iter() {
                                    if looking_data.area.get(a).is_some() {
                                        // env::log(format!("AREA: {:?}", user).as_bytes());
                                        found_area = true;
                                        break;
                                    }
                                }
                            }

                            if found_lenguages || found_area {
                                users.push(user.clone());
                            }
                        }
                    }
                    Categories::Artist(data) => {
                        if artist_data.is_some() {
                            let looking_data = artist_data.as_ref().unwrap();
                            let mut found_area = false;
                            if looking_data.area.len() > 0 && !found_area {
                                for a in data.area.iter() {
                                    if looking_data.area.get(a).is_some() {
                                        found_area = true;
                                        // break;
                                    }
                                }
                            }

                            if found_area {
                                users.push(user.clone());
                            }
                        }
                    }
                }
            }
        }

        return users;
    }

    #[private]
    fn measure_min_token_storage_cost(&mut self) {
        let initial_storage_usage = env::storage_usage();
        let tmp_account_id = "a".repeat(64);
        let u = UnorderedSet::new(unique_prefix(&tmp_account_id));
        self.tokens_per_owner.insert(&tmp_account_id, &u);

        let tokens_per_owner_entry_in_bytes = env::storage_usage() - initial_storage_usage;
        let owner_id_extra_cost_in_bytes = (tmp_account_id.len() - self.owner_id.len()) as u64;

        self.extra_storage_in_bytes_per_token =
            tokens_per_owner_entry_in_bytes + owner_id_extra_cost_in_bytes;

        self.tokens_per_owner.remove(&tmp_account_id);
    }
    
    #[private]
    fn update_user_mint_amount(&mut self, new_mints: u8) -> User {
        let sender_id = env::predecessor_account_id();
        let mut user = self.users.get(&sender_id).expect("Before mint a nft, create an user");
        assert!(
            user.mints < USER_MINT_LIMIT,
            "Exceeded user mint limit {}", USER_MINT_LIMIT
        );
        user.mints += new_mints;
        self.users.insert(&sender_id, &user);
        return user;
    }

    #[private]
    fn assert_owner(&self, account_id: &AccountId) {
        assert_eq!(*account_id, self.owner_id, "Must be owner_id how call its function");
    }
}

// fn is_promise_success() -> bool {
//     assert_eq!(
//         env::promise_results_count(),
//         1,
//         "Contract expected a result on the callback"
//     );
//     match env::promise_result(0) {
//         PromiseResult::Successful(_) => true,
//         _ => false,
//     }
// }

/// Posibles errores que se usan posteriormente como Panic error
#[derive(Serialize, Deserialize, PanicMessage)]
#[serde(crate = "near_sdk::serde", tag = "err")]
pub enum Panic {
    #[panic_msg = "Invalid argument for servise title `{}`: {}"]
    InvalidTitle { len_title: usize, reason: String },

    #[panic_msg = "Invalid argument for servise title `{}`: {}"]
    InvalidDescription { len_description: usize, reason: String },
    /*
    #[panic_msg = "Token ID `{}` must have a positive cantidad"]
    ZeroSupplyNotAllowed { token_id: TokenId },
    #[panic_msg = "Operation is allowed only for admin"]
    AdminRestrictedOperation,
    #[panic_msg = "Unable to delete Account ID `{}`"]
    NotAuthorized { account_id: AccountId },
    #[panic_msg = "Token ID `{:?}` was not found"]
    TokenIdNotFound { token_id: U64 },
    #[panic_msg = "Token ID `{:?}` does not belong to account `{}`"]
    TokenIdNotOwnedBy { token_id: U64, owner_id: AccountId },
    #[panic_msg = "Sender `{}` is not authorized to make transfer"]
    SenderNotAuthToTransfer { sender_id: AccountId },
    #[panic_msg = "The token owner and the receiver should be different"]
    ReceiverIsOwner,
    */
}