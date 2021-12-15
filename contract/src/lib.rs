use std::collections::HashSet;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LookupMap, UnorderedMap, UnorderedSet};
use near_sdk::json_types::{ValidAccountId};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{env, near_bindgen, AccountId, Balance, PanicOnDefault, Promise, StorageUsage};

use crate::internal::*;
pub use crate::nft_core::*;

mod internal;
mod nft_core;

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

pub type TokenId = String;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct Token {
    pub owner_id: AccountId,
    pub metadata: TokenMetadata,
    pub approved_account_ids: HashSet<AccountId>,
    pub approval_id: u64,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Copy, PartialOrd, PartialEq, Eq, Hash)]
#[serde(crate = "near_sdk::serde")]
pub enum UserRoles {
    Professional = 0,
    Employeer = 1,
    Admin = 2,
    Mod = 3,
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, PartialOrd, PartialEq, Eq, Hash)]
#[serde(crate="near_sdk::serde")]
pub enum ArtistAreas {
    Illustration,
    Realism,
    Manga,
    Anime
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, PartialOrd, PartialEq, Eq, Hash)]
#[serde(crate="near_sdk::serde")]
pub enum ProgrammerAreas {
    Backend,
    Frontend,
    Blockchain,
    Testing
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, PartialOrd, PartialEq, Eq, Hash)]
#[serde(crate="near_sdk::serde")]
pub enum ProgramingLenguages {
    Angular,
    Asm,
    C,
    Cplusplus,
    Csharp,
    Css,
    Cuda,
    Docker,
    Go,
    Html,
    Java,
    JavaScript,
    MySql,
    Nodejs,
    OpenGl,
    Php,
    PostgreSql,
    Python,
    R,
    React,
    ReactNative,
    Ruby,
    Rust,
    Sass,
    Sql,
    SqlLite,
    TypeScript,
    Vuejs
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[serde(crate="near_sdk::serde")]
pub struct ProgrammerCategoryData {
    pub lenguages: HashSet<ProgramingLenguages>,
    pub area: HashSet<ProgrammerAreas>
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, PartialEq, Eq)]
#[serde(crate="near_sdk::serde")]
pub struct ArtistCategoryData {
    pub area: HashSet<ArtistAreas>
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize)]
#[serde(crate="near_sdk::serde")]
pub enum Categories {
    Programmer(ProgrammerCategoryData),
    Artist(ArtistCategoryData)
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct TokenMetadata {
    pub fullname: String,
    pub profile_photo_url: String,
    pub linkedin: Option<String>,
    pub github: Option<String>,
    pub education: Option<String>
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
#[serde(crate = "near_sdk::serde")]
pub struct User {
    pub account_id: AccountId,
    pub mints: u8,
    pub roles: HashSet<UserRoles>,
    pub rep: i16,
    pub categories: Vec<Categories>
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Contract {
    pub tokens_id_counter: u128,

    // standard fields (draft)
    pub tokens_per_owner: LookupMap<AccountId, UnorderedSet<TokenId>>,
    pub tokens_by_id: UnorderedMap<TokenId, Token>,
    pub owner_id: AccountId,
    // The storage size in bytes for one account.
    pub extra_storage_in_bytes_per_token: StorageUsage,

    // custom fields for guests and example app (with no backend need to store list of tokens)
    pub users: LookupMap<AccountId, User>,
}

#[near_bindgen]
impl Contract {
    #[init]
    pub fn new(owner_id: ValidAccountId) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        let mut this = Self {
            tokens_id_counter: 0,
            tokens_per_owner: LookupMap::new(b"a".to_vec()),
            tokens_by_id: UnorderedMap::new(b"t".to_vec()),
            users: LookupMap::new(b"u".to_vec()),
            owner_id: owner_id.into(),
            extra_storage_in_bytes_per_token: 0,
        };
        this.measure_min_token_storage_cost();
        return this;
    }
    
    #[payable]
    pub fn nft_mint_service(&mut self, metadata: TokenMetadata) -> Token {
        // self.assert_owner(&env::predecessor_account_id());

        let user = self.update_user_mint_amount(1); // cantidad de servicios
        let owner_id = user.account_id;
        let initial_storage_usage = env::storage_usage();
        // self.assert_owner();
        let token = Token {
            owner_id: owner_id,
            metadata: metadata,
            approved_account_ids: Default::default(),
            approval_id: 0,
        };
        assert!(
            self.tokens_by_id.insert(&self.tokens_id_counter.to_string(), &token).is_none(),
            "Token already exists"
        );
        self.internal_add_token_to_owner(&token.owner_id, &self.tokens_id_counter.to_string());

        let new_token_size_in_bytes = env::storage_usage() - initial_storage_usage;
        let required_storage_in_bytes =
            self.extra_storage_in_bytes_per_token + new_token_size_in_bytes;

        deposit_refund(required_storage_in_bytes);
        self.tokens_id_counter += 1;

        return token;
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

    // Agregar una categoria a la vez
    pub fn add_user(&mut self, account_id: AccountId, role: UserRoles, category: Categories) -> User {
        self.assert_owner(&env::predecessor_account_id());
        
        if role as u8 > 1 {
            env::panic(b"The mod or admin role cannot be grant");
        }

        let tokens_set = UnorderedSet::new(unique_prefix(&account_id));
        self.tokens_per_owner.insert(&account_id, &tokens_set);

        let mut roles = HashSet::new();
        roles.insert(role);
        let mut new_user = User{
            account_id: account_id.clone(),
            mints: 0,
            roles: roles,
            rep: 0,
            categories: Vec::new()
        };
        new_user.categories.push(category);

        new_user.roles.insert(UserRoles::Professional);

        if self.users.insert(&account_id, &new_user).is_some() {
            env::panic(b"User account already added");
        }

        return new_user;
    }

    // Sebas: Un admin u mederador puede eliminar un usuario por la votacion de los usuario.
    // pub fn remove_user(&mut self) {
    //     assert_eq!(env::predecessor_account_id(), self.owner_id, "must be owner_id");
    //     let guest = self.users.get(&public_key.clone().into()).expect("Not a user");
    //     // TODO transfer NFTs
    //     self.tokens_per_owner.remove(&guest.account_id);
    //     self.users.remove(&public_key.into());
    // }

    pub fn get_user(&self, account_id: ValidAccountId) -> User {
        self.users.get(&account_id.into()).expect("No users found. Register the user first")
    }

    pub fn get_user_tokens(&self, account_id: ValidAccountId) -> Vec<Token> {
        let mut tokens: Vec<Token> = Vec::new();
        let tokens_id = self.tokens_per_owner.get(&account_id.into()).expect("No users found or dont have any token").to_vec();
        for i in 0 .. tokens_id.len() {
            let token = self.tokens_by_id.get(&tokens_id[i]).expect("Token id dont match");
            tokens.push( token );
        }
        return tokens;
    }

    // remove approval and guest_sale if there was a removal or if market promise failed to add sale
    // pub fn on_market_updated(&mut self, token_id: TokenId, market_contract: AccountId) {

    //     let mut token = self.tokens_by_id.get(&token_id).expect("Token not found");
    //     token.approved_account_ids.remove(&market_contract);
    //     self.tokens_by_id.insert(&token_id, &token);
    // }
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