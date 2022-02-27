use std::fmt::Display;
use near_sdk::serde::{Deserialize, Serialize};
use serde_with::skip_serializing_none;

// #[derive(Serialize, Deserialize, Debug)]
// #[serde(rename_all = "snake_case")]
// pub enum NearEvent {
//     Dispute(Event)
// }

// #[derive(Serialize, Deserialize, Debug)]
// pub struct Event {
//     #[serde(flatten)]
//     event_kind: Event,
// }

#[derive(Serialize, Deserialize, Debug)]
// #[serde(tag = "event", content = "data")]
#[serde(rename_all = "snake_case")]
// #[allow(clippy::enum_variant_names)]
pub enum Event {
    DisputeNew(DisputeNewData),
    DisputeApplication(DisputeApplicationData),
    DisputeVote(DisputeVoteData),
    DisputeChangeStatus(DisputeChangeStatusData)
}


#[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
pub struct DisputeNewData {
    id: u64,
    service_id: u64, 
    applicant: String, 
    accused: String, 
    jury_members: Vec<String>,
    votes: Option<Vec<bool>>,
    dispute_status: String,
    initial_timestamp: u64,
    finish_timestamp: u64,
    applicant_proves: String,
    accused_proves: String, 
    price: u128,
    winner: Option<String>
}

#[derive(Serialize, Deserialize, Debug)]
pub struct DisputeApplicationData {id: u64, account_id: String}

#[derive(Serialize, Deserialize, Debug)]
pub struct DisputeVoteData {id: u64, account_id: String, vote: bool}

#[derive(Serialize, Deserialize, Debug)]
pub struct DisputeChangeStatusData {id: u64, status: String}


impl Display for Event {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&format!("{}", self.to_json_string()))
    }
}

impl Event {
    // Creacion de una disputa.
    pub fn log_dispute_new(
        id: u64,
        service_id: u64, 
        applicant: String, 
        accused: String, 
        jury_members: Vec<String>,
        votes: Option<Vec<bool>>,
        dispute_status: String,
        initial_timestamp: u64,
        finish_timestamp: u64,
        applicant_proves: String,
        accused_proves: String, 
        price: u128,
        winner: Option<String>
    ) {
        let data = DisputeNewData { id, service_id, applicant, accused, jury_members,
            votes, dispute_status, initial_timestamp, finish_timestamp, 
            applicant_proves, accused_proves, price, winner,
        };
        Event::DisputeNew(data).log();
    }


    // Registro de un nuevo miembro del jurado.
    pub fn log_dispute_aplication(id: u64, account_id: String) {
        let data = DisputeApplicationData { id, account_id };
        Event::DisputeApplication(data).log();
    }

    // Registro de un nuevo voto.
    pub fn log_dispute_vote(id: u64, account_id: String, vote: bool) {
        let data = DisputeVoteData { id, account_id, vote };
        Event::DisputeVote(data).log();
    }

    // Cambio del Status de una disputa.
    pub fn log_dispute_change_status(id: u64, status: String) {
        let data = DisputeChangeStatusData { id, status };
        Event::DisputeChangeStatus(data).log();
    }


    // Funciones internas.
    fn log(&self) { near_sdk::env::log(&self.to_string().as_bytes()); }

    pub(crate) fn to_json_string(&self) -> String { serde_json::to_string(self).unwrap() }   
    // fn event(event_kind: Event) -> Self { Event::Dispute(Event { event_kind }) }
}