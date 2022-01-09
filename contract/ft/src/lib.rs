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
    pub pending_to_mint: Balance,
    pub min_blocked_amount: Balance,
}

const IMAGE_ICON: &str = "";

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
                icon: Some(IMAGE_ICON.to_string()),
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
            token: FungibleToken::new(b"b".to_vec()),
            metadata: LazyOption::new(b"m".to_vec(), Some(&metadata)),
            minter: env::predecessor_account_id(),
            owner: owner_id.clone(),
            allowance: LookupMap::new(b"a".to_vec()),
            pending_to_mint: 0,
            min_blocked_amount: 10_000,
        };
        this.token.internal_register_account(owner_id.as_ref());
        this.token.internal_deposit(owner_id.as_ref(), total_services.into());
        this
    }

    /*******************/
    /*  CORE FUNCTIONS */
    /*******************/

    /// Token mint, limited to the pending amount
    /// Is not possible mint more of this amount
    /// 
    pub fn mint(&mut self, receiver: ValidAccountId) {
        self.assert_minter(env::predecessor_account_id());
        self.mint_into(&receiver.to_string(), self.pending_to_mint);

        self.pending_to_mint = 0;
    }

    /// Cambiar la cuenta con permisos para mintear
    /// Solo puede haber un minter
    /// 
    pub fn update_minter(&mut self, account: AccountId) {
        self.assert_owner();
        self.minter = account;
    }

    /// Cambiar la cantidad minima de tokens a bloquear para poder 
    /// ser miembro del jurado.
    /// 
    pub fn update_min_blocked_amount(&mut self, amount: u128) -> bool {
        self.assert_owner();
        self.min_blocked_amount = amount;
        true
    }

    pub fn transfer_tokens(&mut self, to: AccountId, amount: Balance) -> Balance {
        let sender = env::signer_account_id();

        self.token.internal_register_account(&to);
        self.token.internal_transfer(&sender, &to, amount, None);
        amount
    }

    /// Send tokens to this contract to can be a jury member
    /// This tokens change depending the result of votations
    /// Free withdraw with fn withdraw_tokens (doesn't really blocked)
    /// 
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

    /// Withdraw blocked tokens
    /// Only executable by who blocked it's
    /// 
    #[payable]
    pub fn withdraw_tokens(&mut self, amount: Balance) -> Balance {
        let sender = env::signer_account_id();
        let contract = self.owner.clone().into();

        if self.allowance.get(&sender) >= Some(amount) {
            self.token.internal_transfer(&contract, &sender, amount, None);
        };

        let new_allowace = self.allowance.get(&sender).unwrap_or(0) - amount;
        // Modificar allowance restando lo que se retira
        self.allowance.insert(&sender, &new_allowace);
        
        // Retornar la allowance actualizada
        self.allowance.get(&sender).unwrap_or(0)
    }

    /// Function executable only by the mediator contract
    /// Increase in 3% the balance of the jury member
    /// 
    pub fn increase_allowance(&mut self, account: AccountId) -> Balance {
        self.assert_minter(env::signer_account_id());

        self.pending_to_mint += self.allowance.get(&account).unwrap_or(0) * 103 / 100 - self.allowance.get(&account).unwrap_or(0);
        let new_allowance = self.allowance.get(&account).unwrap_or(0) * 103 / 100 ;

        // Modificar allowance aumentando en 3%
        self.allowance.insert(&account, &new_allowance);

        // Retornar la allowance actualizada
        self.allowance.get(&account).unwrap_or(0)
    }

    /// Function executable only by the mediator contract
    /// Decrease in 3% the balance of the jury member
    /// 
    pub fn decrease_allowance(&mut self, account: AccountId) -> Balance {
        self.assert_minter(env::signer_account_id());

        let new_allowance = self.allowance.get(&account).unwrap_or(0) * 100 / 103;

        // Modificar allowance disminuyendo en 3%
        self.allowance.insert(&account, &new_allowance);

        // Retornar la allowance actualizada
        self.allowance.get(&account).unwrap_or(0)
    }


    /// Verificar que el ususario tenga el suficiente balance bloqueado para poder ser jurado.
    /// Solo ejecutable desde Mediator
    /// 
    pub fn validate_tokens(&self, account_id: AccountId) -> bool {
        let balance = self.get_allowance_of(&account_id);
        if balance < self.min_blocked_amount {
            env::panic(b"Insufficient balance");
        } else {
            return true;
        }
    }

    /**********************/
    /*** GET FUNCTIONS  ***/
    /**********************/

    pub fn get_total_supply(&self) -> Balance {
        self.token.total_supply
    }

    pub fn get_balance_of(&self, account: &AccountId) -> Balance {
        self.token.accounts.get(&account).unwrap_or(0)
    }

    pub fn get_minter(&self) -> AccountId {
        self.minter.clone()
    }

    pub fn get_pending_to_mint(&self) -> Balance {
        self.pending_to_mint.clone()
    }

    pub fn get_allowance_of(&self, account: &AccountId) -> Balance {
        self.allowance.get(&account).unwrap_or(0)
    }

    pub fn verify_blocked_amount(&self, account: &AccountId) -> bool {
        if self.get_allowance_of(account) >= self.min_blocked_amount {
            return true;
        }
        else { return false; }
    }

    /*** 
     * PRIVATE FUNCTIONS 
    ***/

    fn mint_into(&mut self, account_id: &AccountId, amount: Balance) {
        let balance = self.get_balance_of(account_id);
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
//         assert_eq!(contract.ft_total_supply().0, TOTAL_SUPPLY);
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