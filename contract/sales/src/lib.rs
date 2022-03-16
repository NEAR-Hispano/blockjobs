use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::{AccountId, Balance, Duration, env, ext_contract, Gas, 
    near_bindgen, PanicOnDefault, Promise, PromiseResult, Timestamp, 
};
// use chrono::prelude::{Utc, DateTime};

near_sdk::setup_alloc!();

const TOKENS_FOR_SALE: Balance = 500_000;
const BJT_PER_NEAR: Balance = 1000;
const MIN_TO_BUY: Balance = 1 * NEAR;
// const START_TIME_ISO8601: &str = "2021-09-15T12:00:09Z";
const ONE_DAY: u64 = 86400000000000;
const SALE_DURATION: Duration = 30 * ONE_DAY;
const NEAR: Balance = 1_000_000_000_000_000_000_000_000;
const NO_DEPOSIT: Balance = 0;
const GAS_BASE: Gas = 100_000_000_000_000;
const GAS_CALL_BACK: Gas = 60_000_000_000_000;

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Sale {
    ft_contract: AccountId,
    deploy_time: Timestamp,
    final_time: Timestamp,
    buyers: Vec<AccountId>,
    pending_tokens: Balance,
    is_finished: bool,
    admin: AccountId,
    whitelist: Vec<AccountId>,
    average_block_time: u64
}

#[near_bindgen]
impl Sale {
    #[init]
    pub fn new(ft_address: AccountId, admin_id: AccountId) -> Self {
        assert!(!env::state_exists(), "Already initialized");
        assert!(env::is_valid_account_id(&ft_address.as_bytes()), "Invalid ft address");
        assert!(env::is_valid_account_id(&admin_id.as_bytes()), "Invalid admin address");
        Self {
            ft_contract: ft_address,
            deploy_time: env::block_timestamp(),
            final_time: env::block_timestamp() + SALE_DURATION,
            buyers: Vec::new(),
            pending_tokens: TOKENS_FOR_SALE,
            is_finished: false,
            admin: admin_id,
            whitelist: Vec::new(),
            average_block_time: 12200
        }
    }


    /// Comprar tokens BJT a cambio de NEARs.
    /// 
    #[payable]
    pub fn buy_ft(&mut self) {
        assert!(self.is_finished == false, "The sale is ended");
        assert!(env::attached_deposit() >= MIN_TO_BUY, "The minimum to buy is 1 NEAR");

        let amount = env::attached_deposit()/NEAR * BJT_PER_NEAR;

        ext_ft::ft_sale(
            env::current_account_id(),
            env::signer_account_id(),
            amount.clone(),
            &self.ft_contract,
            NO_DEPOSIT,
            // env::attached_deposit(), 
            GAS_BASE,
        ).then(ext_self::on_buy_ft(
            amount,
            &env::current_account_id(),
            NO_DEPOSIT, 
            // GAS_BASE,
            GAS_CALL_BACK
        ));
    }

    pub fn on_buy_ft(&mut self, amount: Balance) -> Balance {
        match env::promise_result(0) {
            PromiseResult::Successful(_data) => {
                env::log(format!("{} tokens selled to {}", amount, env::signer_account_id()).as_bytes());

                self.pending_tokens -= amount;
                return self.pending_tokens;
            }
            PromiseResult::Failed => env::panic(b"Callback faild"),
            PromiseResult::NotReady => env::panic(b"Callback faild"),
        };
    }


    /// Retirar los NEARs obtenidos de la preventa una vez finalizada.
    /// 
    pub fn airdrop(&self, beneficiary: AccountId) -> Balance {
        let time = self.deploy_time + ONE_DAY*30 * self.average_block_time/10000;
        let actual_time = env::block_timestamp();
        assert!(actual_time >= time, "The whitelist isn't finished");
        assert!(env::signer_account_id() == env::current_account_id(), "You haven't permission to withdraw");

        Promise::new(beneficiary).transfer(env::account_balance());

        env::account_balance()
    }

    /// Verificar que haya finalizado el tiempo de preventa.
    /// 
    pub fn verify_sale_finished(&mut self) -> bool {
        if env::block_timestamp() > self.deploy_time + SALE_DURATION {
            self.is_finished = true
        };
        self.is_finished
    }


    /// Retirar los NEARs obtenidos de la preventa una vez finalizada.
    /// 
    pub fn withdraw(&self, beneficiary: AccountId) -> Balance {
        assert!(self.is_finished == true, "The sale isn't finished");
        assert!(env::signer_account_id() == env::current_account_id(), "You haven't permission to withdraw");

        Promise::new(beneficiary).transfer(env::account_balance());

        env::account_balance()
    }

} 

#[ext_contract(ext_ft)]
trait FungibleToken {
    fn ft_sale(&mut self, from: AccountId, to: AccountId, amount: Balance) -> Balance;
}
#[ext_contract(ext_self)]
pub trait ExtSelf {
    fn on_buy_ft(&mut self, amount: Balance) -> Balance;
}