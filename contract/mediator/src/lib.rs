use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::json_types::{ValidAccountId};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::serde_json;
use near_sdk::{env, near_bindgen};

pub enum Vote {
    Yes,
    No
}

pub enum CaseStatus {
    Solved,
    OnGoing,
    Fail,
    Reject
}

pub enum CaseType {
    Report,
    Disagreement,
    Scam,
    DoNotContact
}

pub struct Case {

}

pub struct Mediator {

}

impl Default for Mediator {
    fn default() -> Self {
        env::panic(b"Mediator should be initialized before usage");
    }
}

impl Mediator {

}