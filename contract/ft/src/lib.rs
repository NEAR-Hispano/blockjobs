use near_contract_standards::fungible_token::metadata::{
    FungibleTokenMetadata, FungibleTokenMetadataProvider, FT_METADATA_SPEC,
};
use near_contract_standards::fungible_token::FungibleToken;
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{LazyOption, LookupMap};
use near_sdk::json_types::{ValidAccountId, U128};
use near_sdk::{env, log, near_bindgen, AccountId, Balance, PanicOnDefault, PromiseOrValue};
//use std::convert::TryFrom;

near_sdk::setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Token {
    token: FungibleToken,
    metadata: LazyOption<FungibleTokenMetadata>,
    pub owner: ValidAccountId,
    pub minter: AccountId,
    allowance: LookupMap<AccountId, Balance>,
    pub pending_to_mint: u128,
}

const DATA_IMAGE_SVG_NEAR_ICON: &str = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 288 288'%3E%3Cg id='l' data-name='l'%3E%3Cpath d='M187.58,79.81l-30.1,44.69a3.2,3.2,0,0,0,4.75,4.2L191.86,103a1.2,1.2,0,0,1,2,.91v80.46a1.2,1.2,0,0,1-2.12.77L102.18,77.93A15.35,15.35,0,0,0,90.47,72.5H87.34A15.34,15.34,0,0,0,72,87.84V201.16A15.34,15.34,0,0,0,87.34,216.5h0a15.35,15.35,0,0,0,13.08-7.31l30.1-44.69a3.2,3.2,0,0,0-4.75-4.2L96.14,186a1.2,1.2,0,0,1-2-.91V104.61a1.2,1.2,0,0,1,2.12-.77l89.55,107.23a15.35,15.35,0,0,0,11.71,5.43h3.13A15.34,15.34,0,0,0,216,201.16V87.84A15.34,15.34,0,0,0,200.66,72.5h0A15.35,15.35,0,0,0,187.58,79.81Z'/%3E%3C/g%3E%3C/svg%3E";

#[near_bindgen]
impl Token {
    /// Inicializa el contrato estableciendo el total supply
    /// Asigna la metadata por default
    #[init]
    pub fn new_default_meta(owner_id: ValidAccountId, initial_supply: U128) -> Self {
        Self::new(
            owner_id,
            initial_supply,
            FungibleTokenMetadata {
                spec: FT_METADATA_SPEC.to_string(),
                name: "BlockJobs fungible token".to_string(),
                symbol: "BJT".to_string(),
                icon: Some(DATA_IMAGE_SVG_NEAR_ICON.to_string()),
                reference: None,
                reference_hash: None,
                decimals: 24,
            },
        )
    }

    /// Verifica que el contrato no este ya inicializado
    #[init]
    pub fn new(
        owner_id: ValidAccountId,
        total_services: U128,
        metadata: FungibleTokenMetadata,
    ) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        metadata.assert_valid();
        let mut this = Self {
            token: FungibleToken::new(b"a".to_vec()),
            metadata: LazyOption::new(b"m".to_vec(), Some(&metadata)),
            minter: env::predecessor_account_id(),
            owner: owner_id.clone(),
            allowance: LookupMap::new(b"a".to_vec()),
            pending_to_mint: 0,
        };
        this.token.internal_register_account(owner_id.as_ref());
        this.token.internal_deposit(owner_id.as_ref(), total_services.into());
        this
    }

    /****************** 
     * CORE FUNCTIONS *
     ******************/

    /// Token mint, limited to the pending amount
    /// Is not possible mint more of this amount
    /// 
    pub fn mint(&mut self, receiver: ValidAccountId) {
        self.assert_minter(env::predecessor_account_id());
        self.mint_into(&receiver.to_string(), self.pending_to_mint);

        self.pending_to_mint = 0;
    }

    /// Change the minter
    /// Only can be one minter at time
    /// 
    pub fn update_minter(&mut self, account_id: AccountId) {
        self.assert_owner();
        self.minter = account_id;
    }

    #[payable]
    pub fn transfer_tokens(&mut self, to: AccountId, amount: Balance) -> Balance {
        let sender = env::signer_account_id();

        self.token.internal_register_account(&to);
        self.token.internal_transfer(&sender, &to, amount, None);
        amount
    }

    // #[payable]
    // pub fn block_tokens(&mut self, to: ValidAccountId, amount: Balance) -> Balance {
    //     // if env::predecessor_account_id() == self.owner.to_string()

    //     // self.minter.
    //     let sender = to.to_string();
    //     let contract = self.owner.clone();
    //     self.ft_transfer(contract, amount.into(), None);

    //     // Modificar allowance sumando lo bloqueado
    //     self.allowance.insert(&sender, &(amount + self.allowance.get(&sender).unwrap_or(0)));

    //     // Retornar allowance
    //     self.allowance.get(&sender).unwrap_or(0)
    // }

    #[payable]
    pub fn block_tokens(&mut self, amount: Balance) -> Balance {
        let sender = env::signer_account_id();
        let contract = self.owner.clone();
        self.ft_transfer(contract, amount.into(), None);

        // Modificar allowance sumando lo bloqueado
        self.allowance.insert(&sender, &(amount + self.allowance.get(&sender).unwrap_or(0)));

        // Retornar allowance
        self.allowance.get(&sender).unwrap_or(0)
    }

    #[payable]
    pub fn withdraw_tokens(&mut self, amount: Balance) -> Balance {
        let sender = env::signer_account_id();
        let contract = self.owner.clone().into();

        if self.allowance.get(&sender) >= Some(amount) {
            self.token.internal_transfer(&contract, &sender, amount, None);
        };

        // Modificar allowance restando lo que se retira
        self.allowance.insert(&sender, &(self.allowance.get(&sender).unwrap_or(0) - amount));
        
        // Retornar la allowance actualizada
        self.allowance.get(&sender).unwrap_or(0)
    }

    pub fn increase_allowance(&mut self, account: AccountId) -> Balance {
        self.assert_minter(env::signer_account_id());

        self.pending_to_mint += self.allowance.get(&account).unwrap_or(0) / 100 * 103 - self.allowance.get(&account).unwrap_or(0);
        let new_allowance = self.allowance.get(&account).unwrap_or(0) /100 *103;

        // Modificar allowance aumentando en 3%
        self.allowance.insert(&account, &new_allowance);

        // Retornar la allowance actualizada
        self.allowance.get(&account).unwrap_or(0)
    }

    pub fn decrease_allowance(&mut self, account: AccountId) -> Balance {
        self.assert_minter(env::signer_account_id());

        let new_allowance = self.allowance.get(&account).unwrap_or(0) /103 *100;

        // Modificar allowance disminuyendo en 3%
        self.allowance.insert(&account, &new_allowance);

        // Retornar la allowance actualizada
        self.allowance.get(&account).unwrap_or(0)
    }
    // pub fn set_mediator(&self, mediator_account_id: AccountId) {
    //     self.assert_owner();
    //     &self.mediator = &mediator_account_id;
    // }

    /******************
     * GET FUNCTIONS  *
     ******************/

    pub fn ft_get_total_supply(&self) -> Balance {
        self.token.total_supply
    }

    pub fn ft_get_balance_of(&self, account_id: &AccountId) -> Balance {
        self.token.accounts.get(&account_id).unwrap_or(0)
    }

    pub fn ft_get_minter(&self) -> AccountId {
        self.minter.clone()
    }

    pub fn ft_get_pending_to_mint(&self) -> Balance {
        self.pending_to_mint.clone()
    }

    /*** 
     * PRIVATE FUNCTIONS 
    ***/

    fn mint_into(&mut self, account_id: &AccountId, amount: Balance) {
        let balance = self.ft_get_balance_of(account_id);
        self.internal_update_account(&account_id, balance + amount);
        self.token.total_supply += amount;
    }

    fn internal_update_account(&mut self, account_id: &AccountId, balance: u128) {
        self.token.accounts.insert(account_id, &balance); //insert_or_update
    }

    // Verificar que sea el owner
    fn assert_owner(&self) {
        assert!(
            env::predecessor_account_id() == self.owner.to_string(),
            "Can only be called by the owner"
        );
    }

    // Verificar que tenga permisos para mintear tokens
    fn assert_minter(&self, account_id: String) {
        assert_eq!(self.minter == account_id, true, "Not is the minter");
    }

    // Verificar deposito
    pub fn assert_one_yocto(&self) {
        assert_eq!(env::attached_deposit(), 1, "Requires attached deposit of exactly 1 yoctoNEAR")
    }

    fn on_account_closed(&mut self, account_id: AccountId, balance: Balance) {
        log!("Closed @{} with {}", account_id, balance);
    }

    fn on_tokens_burned(&mut self, account_id: AccountId, amount: Balance) {
        log!("Account @{} burned {}", account_id, amount);
    }
}

near_contract_standards::impl_fungible_token_core!(Token, token, on_tokens_burned);
near_contract_standards::impl_fungible_token_storage!(Token, token, on_account_closed);

#[near_bindgen]
impl FungibleTokenMetadataProvider for Token {
    fn ft_metadata(&self) -> FungibleTokenMetadata {
        self.metadata.get().unwrap()
    }
}

// #[cfg(all(test, not(target_arch = "wasm32")))]
// mod tests {
//     use near_sdk::test_utils::{accounts, VMContextBuilder};
//     use near_sdk::MockedBlockchain;
//     use near_sdk::{testing_env, Balance};

//     use super::*;

//     const TOTAL_SUPPLY: Balance = 1_000_000_000_000_000;

//     fn get_context(predecessor_account_id: ValidAccountId) -> VMContextBuilder {
//         let mut builder = VMContextBuilder::new();
//         builder
//             .current_account_id(accounts(0))
//             .signer_account_id(predecessor_account_id.clone())
//             .predecessor_account_id(predecessor_account_id);
//         builder
//     }

//     #[test]
//     fn test_new() {
//         let mut context = get_context(accounts(1));
//         testing_env!(context.build());
//         let contract = Token::new_default_meta(accounts(1).into(), TOTAL_SUPPLY.into());
//         testing_env!(context.is_view(true).build());
//         assert_eq!(contract.ft_total_services().0, TOTAL_SUPPLY);
//         assert_eq!(contract.ft_balance_of(accounts(1)).0, TOTAL_SUPPLY);
//     }

//     #[test]
//     #[should_panic(expected = "The contract is not initialized")]
//     fn test_default() {
//         let context = get_context(accounts(1));
//         testing_env!(context.build());
//         let _contract = Token::default();
//     }

//     #[test]
//     fn test_transfer() {
//         let mut context = get_context(accounts(2));
//         testing_env!(context.build());
//         let mut contract = Token::new_default_meta(accounts(2).into(), TOTAL_SUPPLY.into());
//         testing_env!(context
//             .storage_usage(env::storage_usage())
//             .attached_deposit(contract.storage_balance_bounds().min.into())
//             .predecessor_account_id(accounts(1))
//             .build());
//         // Paying for account registration, aka storage deposit
//         contract.storage_deposit(None, None);

//         testing_env!(context
//             .storage_usage(env::storage_usage())
//             .attached_deposit(1)
//             .predecessor_account_id(accounts(2))
//             .build());
//         let transfer_amount = TOTAL_SUPPLY / 3;
//         contract.ft_transfer(accounts(1), transfer_amount.into(), None);

//         testing_env!(context
//             .storage_usage(env::storage_usage())
//             .account_balance(env::account_balance())
//             .is_view(true)
//             .attached_deposit(0)
//             .build());
//         assert_eq!(contract.ft_balance_of(accounts(2)).0, (TOTAL_SUPPLY - transfer_amount));
//         assert_eq!(contract.ft_balance_of(accounts(1)).0, transfer_amount);
//     }
// }