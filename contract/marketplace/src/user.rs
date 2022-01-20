use std::collections::{HashSet};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{AccountId};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Copy, PartialOrd, PartialEq, Eq, Hash, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum UserRoles {
    Professional = 0,
    Employeer = 1,
    Admin = 2,
    Judge = 3,
}

// No deberia dar problemas
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct PersonalData {
    pub legal_name: String,
    pub education: String,
    pub links: Vec<String>,
    pub picture: String,
    pub bio: String,
    pub country: String
}
 
#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct User {
    pub account_id: AccountId,
    pub mints: u16,
    pub roles: HashSet<UserRoles>,
    pub reputation: i16,
    pub personal_data: Option<String>,
    /*
        personal_data:  {
            legal_name: "",
            education: "",
            links: "",
            picture: "",
            bio: "",
            country: "",
            languages: [{
                language: "Ingles",
                level: "Intermedio"
            }]
        }
    */
    pub banned: bool,
}

// #[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize)]
// #[serde(crate = "near_sdk::serde")]
// pub struct Category {
//     pub category: String,
//     pub subcategory: String,
//     pub areas: String,
// }
