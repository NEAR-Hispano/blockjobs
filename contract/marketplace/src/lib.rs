use std::collections::{HashSet};
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};
use near_sdk::{AccountId};
use std::fmt::{Display, Formatter, Result};

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Copy, PartialOrd, PartialEq, Eq, Hash, Debug)]
#[serde(crate = "near_sdk::serde")]
pub enum UserRoles {
    Professional = 0,
    Employeer = 1,
    Admin = 2,
    Judge = 3,
}

impl Display for UserRoles {
    fn fmt(&self, f: &mut Formatter) -> Result {
        match self {
            UserRoles::Professional => write!(f, "Professional"),
            UserRoles::Employeer => write!(f, "Employeer"),
            UserRoles::Admin => write!(f, "Admin"),
            UserRoles::Judge => write!(f, "Judge"),
        }
    }
}


// #[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
// #[serde(crate = "near_sdk::serde")]
// pub enum IdiomLevel {
//     Beginner,
//     Intermedian,
//     Expert,
//     Native
// }

#[derive(BorshDeserialize, BorshSerialize, Serialize, Deserialize, Clone, Debug)]
#[serde(crate = "near_sdk::serde")]
pub struct Idiom {
    idiom: String,
    level: String
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
    pub country: String,
    pub email: String,
    pub idioms: Vec<Idiom>
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