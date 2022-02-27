use near_sdk::{ env, ext_contract, near_bindgen, setup_alloc, AccountId, Balance, 
    Gas, PanicOnDefault, Promise, PromiseResult
};
// , Promise, serde_json::{json}};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::UnorderedMap;
use near_sdk::json_types::{ValidAccountId, U128};
use near_sdk::serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::fmt::{Debug, Display, Formatter, Result};
// use std::convert::TryFrom;

mod events;
use events::Event;

// const YOCTO_NEAR: u128 = 1000000000000000000000000;
// const STORAGE_PRICE_PER_BYTE: Balance = 10_000_000_000_000_000_000;
// const NANO_SECONDS: u32 = 1_000_000_000;
const NO_DEPOSIT: Balance = 0;
const BASE_GAS: Gas = 30_000_000_000_000;
const MAX_GAS: Gas = 250_000_000_000_000;
const ONE_DAY: u64 = 86400000000000;
const YOCTO_NEAR: u128 = 1000000000000000000000000;
const GAS_FT_TRANSFER: Gas = 14_000_000_000_000;

setup_alloc!();

pub type DisputeId = u64;

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, PartialEq, Debug, Clone)]
#[serde(crate = "near_sdk::serde")]
pub enum DisputeStatus {
    Open,       //Tiempo para subir pruebas y para registrarse los jurados -Duracion: 5 dias
    Voting,  //Tiempo para realizar las votaciones -Duracion: 5 dias
    Executable, //Tiempo para ejecutarse los resultado -Duracion: 0.5 dias
    Finished,   //Indica que la disputa finalizo exitosamente -Duracion: indefinida
}

impl Display for DisputeStatus {
    fn fmt(&self, f: &mut Formatter) -> Result {
        match self {
            DisputeStatus::Open => write!(f, "Open"),
            DisputeStatus::Voting => write!(f, "Voting"),
            DisputeStatus::Executable => write!(f, "Executable"),
            DisputeStatus::Finished => write!(f, "Finished"),
        }
    }
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Debug, Hash, Eq, PartialOrd, PartialEq, Clone)]
#[serde(crate = "near_sdk::serde")]
pub struct Vote {
    // Miembro del jurado que emite el voto
    account: AccountId,
    // Decision tomada 
    vote: bool,
}

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Dispute {
    // Identificador para cada disputa.
    id: DisputeId,
    service_id: u64,
    // Lista de miembros del jurado y sus respectivos votos.
    jury_members: Vec<AccountId>,
    votes: HashSet<Vote>,
    // Estado actual de la disputa.
    dispute_status: DisputeStatus,
    // Tiempos.
    initial_timestamp: u64,
    finish_timestamp: Option<u64>, //Time.
    // Partes.
    applicant: AccountId, // Empleador demandante.
    accused: AccountId,   // Profesional acusado.
    winner: Option<AccountId>,
    // Pruebas.
    applicant_proves: String,       // Un markdown con las pruebas.
    accused_proves: Option<String>, // Un markdown con las pruebas.
    // Precio pagado por el servicio.
    price: u128,
}

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
pub struct Mediator {
    disputes: UnorderedMap<DisputeId, Dispute>,
    disputes_counter: u64,
    owner: AccountId,
    admins: Vec<AccountId>,
    marketplace_contract: AccountId,
    token_contract: AccountId,
    // Numero de jurado para las disputas, puede modificarse por el Owner.
    max_jurors: u8,
}

#[near_bindgen]
impl Mediator {
    #[init]
    pub fn new(marketplace_id: AccountId, token_id: AccountId) -> Self{
        if env::state_exists() {
            env::panic("Contract already inicialized".as_bytes());
        }
        let this = Self {
            disputes: UnorderedMap::new(b"d"),
            disputes_counter: 0,
            owner: env::signer_account_id(),
            admins: Vec::new(),
            marketplace_contract: marketplace_id,
            token_contract:  token_id,
            max_jurors: 2,
        };
        return this;
    }

    //////////////////////////////////////
    ///        CORE FUNCTIONS          ///
    //////////////////////////////////////

    /// Ejecutable desde Marketplace por el empleador que haya comprado el servicio.
    /// 
    #[payable]
    pub fn new_dispute(&mut self, service_id: u64, applicant: AccountId, accused: AccountId, proves: String, price: u128) -> u64 {
        if env::attached_deposit() < 1 {
            env::panic(b"To create a new dispute, deposit 0.1 near");
        }
        let dispute = Dispute {
            id: self.disputes_counter.clone(),
            service_id: service_id,
            jury_members: Vec::new(),
            votes: HashSet::new(),
            dispute_status: DisputeStatus::Open,
            initial_timestamp: env::block_timestamp(),
            finish_timestamp: None,
            applicant: applicant,
            accused: accused.to_string(),
            winner: None,
            applicant_proves: proves,
            accused_proves: None,
            price: price,
        };
        env::log(format!("{:?}", dispute).as_bytes());

        self.disputes.insert(&dispute.id, &dispute);
        self.disputes_counter += 1;

        let status: String = dispute.dispute_status.to_string();

        Event::log_dispute_new(
            dispute.id.clone(),
            dispute.service_id.clone(),
            dispute.applicant.clone(),
            dispute.accused.clone(),
            dispute.jury_members.clone(),
            None,
            status,
            dispute.initial_timestamp.clone(),
            0,
            dispute.applicant_proves.clone(),
            "".to_string(),
            dispute.price.clone(),
            None
        );

        return self.disputes_counter -1;
    }

    /// Anadir pruebas por parte del profesional acusado.
    /// 
    #[allow(unused_must_use)]
    pub fn add_accused_proves(&mut self, dispute_id: DisputeId, accused_proves: String) -> Dispute {
        let mut dispute = self.update_dispute_status(dispute_id);
        if dispute.dispute_status != DisputeStatus::Open {
            env::panic(b"Time to upload proves is over");
        }

        // Verificar que sea la persona acusada
        let sender = env::predecessor_account_id();
        if sender != dispute.accused {
            env::panic(b"Address without permissions to upload proves")
        };

        // Verificar que no haya subido ya las pruebas
        if dispute.accused_proves.is_some() {
            env::panic(b"You already upload the proves!");
        }

        dispute.accused_proves.insert(accused_proves);
        // dispute.dispute_status = DisputeStatus::Voting;

        self.disputes.insert(&dispute_id, &dispute);

        return dispute;
    }


    /// Añadirse como miembro del jurado para una disputa especifica.
    /// Solo ejecutable mientras la disputa esta en Open.
    /// Se verifica en Marketplace que cumpla con el rol de Judge y reputacion de 3 o mas.
    /// 
    pub fn pre_vote(&mut self, dispute_id: u64) -> bool {
        let dispute = self.get_dispute(dispute_id);
        if dispute.dispute_status != DisputeStatus::Open {
            env::panic(b"The time to join as a jury member is over");
        }
        let _res = ext_marketplace::validate_user(
            env::signer_account_id(),
            &self.marketplace_contract,
            NO_DEPOSIT,
            BASE_GAS,
        ).then(ext_self::on_pre_vote(
            dispute_id,
            env::predecessor_account_id(),
            &env::current_account_id(),
            NO_DEPOSIT,
            BASE_GAS,
        ));

        Event::log_dispute_aplication(
            dispute_id.clone(), 
            env::signer_account_id()
        );

        true
    }

    /// Adicion del miembro del jurado en caso de cumplirse la verificacion desde marketplace.
    /// 
    pub fn on_pre_vote(&mut self, dispute_id: u64, user_id: AccountId) {
        if env::predecessor_account_id() != env::current_account_id() {
            env::panic(b"Only the contract can call its function")
        }
        assert_eq!(env::promise_results_count(), 1, "Contract expected a result on the callback");
        
        match env::promise_result(0) {
            PromiseResult::Successful(_data) => {
                let mut dispute = self.get_dispute(dispute_id.clone());

                dispute.jury_members.push(user_id);

                if dispute.jury_members.len() == self.max_jurors as usize {
                    dispute.dispute_status = DisputeStatus::Voting
                }

                self.disputes.insert(&dispute_id, &dispute);
            }
            PromiseResult::Failed => env::panic(b"Callback faild"),
            PromiseResult::NotReady => env::panic(b"Callback faild"),
        };
    }

    /// Emitir un voto.
    /// Solo para miembros del jurado de la misma categoria del servicio en disputa.
    /// Se requiere cumplir con un minimo de tokens bloqueados en FT.
    /// 
    pub fn vote(&mut self, dispute_id: DisputeId, vote: bool) {
        let sender = env::predecessor_account_id();
        let dispute = self.update_dispute_status(dispute_id);

        // Verificar que la disputa este en tiempo de votacion
        if dispute.dispute_status != DisputeStatus::Voting {
            env::panic(b"You cannot vote when the status is different from Voting");
        }
        // Verificar que sea miembro del jurado
        if !dispute.jury_members.contains(&sender) {
            env::panic(b"You can't permission to vote in the indicate dispute");
        }

        Event::log_dispute_vote(
            dispute_id.clone(), 
            sender.clone().to_string(), 
            vote.clone()
        );

        let _res = ext_ft::validate_tokens(
            sender.clone(),
            &self.token_contract,
            NO_DEPOSIT,
            BASE_GAS,
        ).then(ext_self::on_vote(
            dispute_id,
            sender,
            vote,
            &env::current_account_id(),
            NO_DEPOSIT,
            BASE_GAS,
        ));
    }


    /// Adicion del miembro del jurado en caso de cumplirse la verificacion desde Marketplace.
    /// 
    pub fn on_vote(&mut self, dispute_id: u64, user_id: AccountId, vote: bool) -> Dispute {
        if env::predecessor_account_id() != env::current_account_id() {
            env::panic(b"Only the contract can call its function")
        }
        assert_eq!(env::promise_results_count(), 1, "Contract expected a result on the callback");
        
        match env::promise_result(0) {
            PromiseResult::Successful(_data) => {
                let mut dispute = self.update_dispute_status(dispute_id);

                dispute.votes.insert( Vote {
                    account: user_id, 
                    vote: vote
                });
        
                // Si se completan los votos se pasa la siguiente etapa
                if dispute.votes.len() == self.max_jurors as usize {
                    dispute.dispute_status = DisputeStatus::Executable
                }
                self.disputes.insert(&dispute_id, &dispute);
        
                return dispute;
            }
            PromiseResult::Failed => env::panic(b"Callback faild"),
            PromiseResult::NotReady => env::panic(b"Callback faild"),
        };
    }


    /// Pagar al profesional o empleador según corresponda.
    /// Solo ejecutable desde Marketplace.
    /// 
    pub fn pay_service(&self, beneficiary: AccountId, amount: U128, token: String) {
        let sender = env::predecessor_account_id();
        env::log(sender.as_bytes());
        env::log(self.marketplace_contract.as_bytes());
        env::log(self.owner.as_bytes());
        if sender != self.marketplace_contract && sender != self.owner {
            env::panic(b"You don't have permissions to generate a payment");
        }

        if token == "near".to_string() {
            // Realizar el pago en NEARs.
            Promise::new(beneficiary).transfer(amount.0 * YOCTO_NEAR);
        } else {
            ext_contract::ft_transfer(
                beneficiary.clone(),
                amount.clone(),
                None,
                &token, 
                1, 
                GAS_FT_TRANSFER
            );
        }
    }

    /// Pagar al profesional o empleador según corresponda.
    /// Solo ejecutable internamente por Mediator.
    /// 
    pub fn internal_pay_service(&self, beneficiary: AccountId, amount: Balance) -> Balance {
        self.assert_owner(&env::signer_account_id());

        // Realizar el pago en NEARs.
        Promise::new(beneficiary).transfer(amount);

        env::account_balance()
    }


    /// Para verificar y actualizar el estado de la disputa.
    /// 
    pub fn update_dispute_status(&mut self, dispute_id: DisputeId) -> Dispute {
        let mut dispute: Dispute = expect_value_found(self.disputes.get(&dispute_id), "Disputa no encontrada".as_bytes());

        let actual_time = env::block_timestamp();

        // Actualizar por tiempo
        if actual_time >= (dispute.initial_timestamp + (ONE_DAY * 5)) && (dispute.dispute_status == DisputeStatus::Open) {
            dispute.dispute_status = DisputeStatus::Voting;
        }
        if (actual_time >= (dispute.initial_timestamp + (ONE_DAY * 10))) && (dispute.dispute_status == DisputeStatus::Voting) {
            dispute.dispute_status = DisputeStatus::Executable;
        }
        if dispute.dispute_status == DisputeStatus::Executable {
            let mut agains_votes_counter = 0;
            let mut pro_votes_counter = 0;
            for v in dispute.votes.iter() {
                if v.vote {
                    pro_votes_counter += 1;
                }
                else {
                    agains_votes_counter += 1;
                }
            }

            // reiniciar si se cumple esta condicion
            if pro_votes_counter == agains_votes_counter {
                dispute.dispute_status = DisputeStatus::Open;
                dispute.accused_proves = Some("".to_string());

                dispute.applicant_proves.clear();
                dispute.jury_members.clear();
                dispute.votes.clear();
            }
            else {
                dispute.dispute_status = DisputeStatus::Finished;
                if pro_votes_counter > agains_votes_counter {
                    dispute.winner = Some(dispute.applicant.clone());

                    // Pagar al empleador
                    Promise::new(dispute.applicant.clone()).transfer(dispute.price.clone());

                    let _res = ext_ft::applicant_winner(
                        dispute.votes.clone(),
                        &self.token_contract,
                        NO_DEPOSIT, MAX_GAS
                    );
                }
                else {
                    dispute.winner = Some(dispute.accused.clone());

                    // Pagar al profesional
                    Promise::new(dispute.accused.clone()).transfer(dispute.price.clone());

                    let _res = ext_ft::accused_winner(
                        dispute.votes.clone(),
                        &self.token_contract,
                        NO_DEPOSIT, MAX_GAS
                    );
                }

                dispute.finish_timestamp = Some(env::block_timestamp());

                let _res = ext_marketplace::return_service_by_mediator(
                    dispute.service_id,
                    &self.marketplace_contract, NO_DEPOSIT, BASE_GAS)
                .then(ext_self::on_return_service(
                    dispute.service_id,
                    &env::current_account_id(), NO_DEPOSIT, BASE_GAS)
                );
            }
        }
        
        self.disputes.insert(&dispute_id, &dispute);

        Event::log_dispute_change_status(
            dispute_id.clone(),
            dispute.dispute_status.clone().to_string());

        dispute
    }


    // pub fn increase(&mut self, dispute_id: u64) -> Dispute {
    //     let dispute = expect_value_found(self.disputes.get(&dispute_id), "Disputa no encontrada".as_bytes());

    //     let _res = ext_ft::increase_allowance(
    //         env::current_account_id(),
    //         &self.token_contract, NO_DEPOSIT, BASE_GAS);

    //     dispute
    // }

    // pub fn decrease(&mut self, dispute_id: u64) -> Dispute {
    //     let dispute = expect_value_found(self.disputes.get(&dispute_id), "Disputa no encontrada".as_bytes());

    //     let _res = ext_ft::decrease_allowance(
    //         env::current_account_id(),
    //         &self.token_contract, NO_DEPOSIT, BASE_GAS);
            
    //     dispute
    // }

    /// Bannear un usuario para casos de fraudes en disputas.
    /// 
    pub fn ban_user(&self, user_id: AccountId) {
        self.assert_admin(&env::signer_account_id());

        let _res = ext_marketplace::ban_user_by_mediator(
            user_id,
            &self.marketplace_contract,
            NO_DEPOSIT, BASE_GAS)
            .then(ext_self::on_ban_user(
                &self.owner,
                NO_DEPOSIT, BASE_GAS
            )
        );
    }


    /// Modificar la cantidad maxima de votantes para las disputas.
    /// Solo ejecutable por Owner.
    ///
    pub fn update_max_jurors(&mut self, quantity: u8) -> u8 {
        self.assert_owner(&env::signer_account_id());
        self.max_jurors = quantity;
        quantity
    }

    /// Modificar contrato de Marketpla
    ///
    pub fn update_marketplace_contract(&mut self, marketplace_contract: AccountId) -> AccountId{
        self.assert_owner(&env::signer_account_id());
        self.marketplace_contract = marketplace_contract.clone();

        marketplace_contract
    }


    //////////////////////////////////////
    ///         Metodos GET            ///
    //////////////////////////////////////
    
    pub fn get_dispute_status(&mut self, dispute_id: DisputeId) -> Dispute {
        self.update_dispute_status(dispute_id)
    }

    pub fn get_dispute(&self, dispute_id: DisputeId) -> Dispute {
        let dispute = expect_value_found(self.disputes.get(&dispute_id), b"Dispute not found");
        dispute
    }
    pub fn get_disputes(&self, from_index: u64, limit: u64) -> Vec<Dispute> {
        let values = self.disputes.values_as_vector();
        return (from_index..std::cmp::min(from_index + limit, self.disputes.len()))
            .map(|index| values.get(index).unwrap())
            .collect();
    }

    pub fn get_total_disputes(&self) -> u64 {
        self.disputes_counter
    }

    pub fn get_max_jurors(&self) -> u8 {
        self.max_jurors
    }

    // Retorna un vector con los jurados actuales de una disputa indicada. 
    pub fn get_dispute_jury_members(&self, dispute_id: DisputeId) -> Vec<AccountId> {
        self.assert_dispute_exist(dispute_id);
        let dispute = self.get_dispute(dispute_id);
        return dispute.jury_members;
    }

    // Retorna un vector con los administradores.
    pub fn get_admins(&self) -> Vec<AccountId> {
        self.admins.clone()
    }


    //////////////////////////////////////
    ///      Funciones internas        ///
    //////////////////////////////////////
    
    // Verificacion de que sea el Owner.
    fn assert_owner(&self, account: &AccountId) {
        if *account != self.owner {
            env::panic(b"Isn't the owner");
        }
    }

    // Verificacion de que la disputa existe.
    fn assert_dispute_exist(&self, dispute_id: DisputeId) {
        if self.get_total_disputes() < dispute_id {
            env::panic(b"The indicated dispute doesn't exist");
        }
    }

    // Verificacion de que es un Admin.
    fn assert_admin(&self, account: &AccountId) {
        if !self.admins.contains(&account) {
            env::panic(b"Isn't an Admin");
        }
    }
    

    /// Callback para retornar el servicio al profesional en Marketplace.
    /// 
    pub fn on_return_service(_service_id: u64) {
        if env::predecessor_account_id() != env::current_account_id() {
            env::panic(b"only the contract can call its function")
        }
        assert_eq!(
            env::promise_results_count(), 1,
            "Contract expected a result on the callback"
        );
        match env::promise_result(0) {
            PromiseResult::Successful(_data) => {
                env::log(b"Service returned to creator");
            },
            PromiseResult::Failed => env::panic(b"Callback faild"),
            PromiseResult::NotReady => env::panic(b"Callback faild"),
        };
    }

    /// Callback para incrementar en 3% los tokens de quien voto correctamente.
    /// 
    pub fn on_increase_allowance() {
        if env::predecessor_account_id() != env::current_account_id() {
            env::panic(b"only the contract can call its function")
        }
        assert_eq!(
            env::promise_results_count(), 1,
            "Contract expected a result on the callback"
        );
        match env::promise_result(0) {
            PromiseResult::Successful(_data) => {
                env::log(b"Allowance increase");
            },
            PromiseResult::Failed => env::panic(b"Callback faild"),
            PromiseResult::NotReady => env::panic(b"Callback faild"),
        };
    }

    /// Callback para decrementar en 3% los tokens de quien voto incorrectamente.
    /// 
    pub fn on_decrease_allowance() {
        if env::predecessor_account_id() != env::current_account_id() {
            env::panic(b"only the contract can call its function")
        }
        assert_eq!(
            env::promise_results_count(), 1,
            "Contract expected a result on the callback"
        );
        match env::promise_result(0) {
            PromiseResult::Successful(_data) => {
                env::log(b"Allowance decreased");
            },
            PromiseResult::Failed => env::panic(b"Callback faild"),
            PromiseResult::NotReady => env::panic(b"Callback faild"),
        };
    }


    /// Solo para pruebas
    pub fn change_dispute_status(&mut self, dispute_id: u64) -> DisputeStatus {
        let mut dispute = self.get_dispute(dispute_id);
        dispute.dispute_status = DisputeStatus::Executable;
        self.disputes.insert(&dispute_id, &dispute);
        dispute.dispute_status
    }
}

#[ext_contract(ext_marketplace)]
pub trait Marketplace {
    fn validate_user(account_id: AccountId);
    fn return_service_by_mediator(service_id: u64);
    fn ban_user_by_mediator(user_id: AccountId);
}
#[ext_contract(ext_ft)]
pub trait ExtFT {
    fn validate_tokens(account_id: AccountId);
    // fn increase_allowance(account: AccountId);
    // fn decrease_allowance(account: AccountId);
    fn applicant_winner(votes: HashSet<Vote>);
    fn accused_winner(votes: HashSet<Vote>);
}
#[ext_contract(ext_self)]
pub trait ExtSelf {
    fn on_pre_vote(dispute_id: u64, user_id: AccountId);
    fn on_vote(dispute_id: u64, user_id: AccountId, vote: bool);
    fn on_return_service(service_id: u64);
    // fn on_increase_allowance();
    // fn on_decrease_allowance();
    fn on_ban_user();
}
#[ext_contract(ext_contract)]
trait ExtContract {
    fn ft_transfer(&mut self, receiver_id: AccountId, amount: U128, memo: Option<String>);
    fn ft_transfer_call(&mut self, receiver_id: ValidAccountId, amount: U128, memo: Option<String>, msg: String) -> PromiseOrValue<U128>;
}

fn expect_value_found<T>(option: Option<T>, message: &[u8]) -> T {
    option.unwrap_or_else(|| env::panic(message))
}

// pub(crate) fn string_to_valid_account_id(account_id: &String) -> ValidAccountId{
//     return ValidAccountId::try_from((*account_id).to_string()).unwrap();
// }

// pub(crate) fn unique_prefix(account_id: &AccountId) -> Vec<u8> {
//     let mut prefix = Vec::with_capacity(33);
//     prefix.push(b'o');
//     prefix.extend(env::sha256(account_id.as_bytes()));
//     return prefix
// }

// #[cfg(test)]
// mod tests {
//     use super::*;
//     use near_sdk::test_utils::{VMContextBuilder, accounts};
//     use near_sdk::MockedBlockchain;
//     use near_sdk::{testing_env, VMContext};

//     fn get_context(is_view: bool) -> VMContext {
//         VMContextBuilder::new()
//             .signer_account_id(accounts(1))
//             .predecessor_account_id(accounts(2))
//             .attached_deposit(100000000000000000)
//             .is_view(is_view)
//             .build()
//     }

//     fn get_account(id: usize) -> String {
//         return accounts(id).to_string()
//     }

//     #[test]
//     fn test1() {
//         let contract_account = "mediator.near";
//         let applicant = get_account(0);
//         let accused = get_account(1);
//         let judges = [get_account(2), get_account(3)];

//         let mut context = get_context(false);
//         context.attached_deposit = 58700000000000000000000;
//         context.epoch_height = 0;
//         context.predecessor_account_id = applicant.clone();
//         context.block_timestamp = 1640283546;
//         context.current_account_id = contract_account.to_string();
//         testing_env!(context);

//         let mut contract = Mediator::new("marketplace.near".to_string());
//         let mut dispute = contract.new_dispute_test(2, string_to_valid_account_id(&"employer".to_string()), "Prueba en markdown".to_string());

//         let mut context = get_context(false);
//         context.attached_deposit = 58700000000000000000000;
//         context.block_timestamp = 1640283546 + ONE_DAY;
//         context.epoch_height = 0;
//         context.predecessor_account_id = judges[0].clone();
//         context.current_account_id = contract_account.to_string();
//         testing_env!(context);
//         contract.add_judge_test(dispute.id.clone());

//         let mut context = get_context(false);
//         context.attached_deposit = 58700000000000000000000;
//         context.epoch_height = 0;
//         context.block_timestamp = 1640283546 + (ONE_DAY * 2);
//         context.predecessor_account_id = judges[1].clone();
//         context.current_account_id = contract_account.to_string();
//         testing_env!(context);
//         contract.add_judge_test(dispute.id.clone());

//         let mut context = get_context(false);
//         context.attached_deposit = 58700000000000000000000;
//         context.epoch_height = 0;
//         context.block_timestamp = 1640283546 + (ONE_DAY * 2);
//         context.predecessor_account_id = accused.clone();
//         context.current_account_id = contract_account.to_string();
//         testing_env!(context);
//         contract.add_accused_proves(dispute.id.clone(), "Markdown accused proves".to_string());

//         let max_epochs = 26;
//         let mut judges_votes = 0;
//         for i in 2..max_epochs {
//             let mut context = get_context(false);
//             if dispute.dispute_status == DisputeStatus::Voting && judges_votes < 2{
//                 context.predecessor_account_id = judges[judges_votes].clone();
//                 contract.vote(dispute.id.clone(), true); //judges_votes != 0
//                 judges_votes += 1;
//             }
//             else {
//                 context.predecessor_account_id = applicant.clone();
//             }
//             context.attached_deposit = 58700000000000000000000;
//             context.epoch_height = i;
//             context.current_account_id = contract_account.to_string();
//             context.block_timestamp = 1640283546 + (ONE_DAY * i);
//             testing_env!(context.clone());
//             dispute = contract.update_dispute_status(dispute.id.clone());

//             println!("Epoca: {}, estatus: {:#?}, {:?}", context.block_timestamp, dispute.dispute_status, dispute.votes);

//         }
//         let winner = dispute.winner.expect("Debe haber un ganador");

//         println!("");
//         println!("The winner is {:?}", winner);
//     }
// }