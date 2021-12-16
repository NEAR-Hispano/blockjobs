use std::collections::HashSet;

use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::serde::{Deserialize, Serialize};

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, PartialOrd, PartialEq, Eq, Hash, Clone)]
#[serde(crate="near_sdk::serde")]
pub enum ArtistAreas {
    Illustration,
    Realism,
    Manga,
    Anime
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, PartialOrd, PartialEq, Eq, Hash, Clone)]
#[serde(crate="near_sdk::serde")]
pub enum ProgrammerAreas {
    Backend,
    Frontend,
    Blockchain,
    Testing
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, PartialOrd, PartialEq, Eq, Hash, Clone)]
#[serde(crate="near_sdk::serde")]
pub enum ProgramingLenguages {
    Angular,
    C,
    Cplusplus,
    Css,
    Docker,
    Go,
    Html,
    Java,
    JavaScript,
    MySql,
    Nodejs,
    Php,
    Python,
    R,
    React,
    Ruby,
    Rust,
    Sql,
    TypeScript,
    Vuejs
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone)]
#[serde(crate="near_sdk::serde")]
pub struct ProgrammerCategoryData {
    pub lenguages: HashSet<ProgramingLenguages>,
    pub area: HashSet<ProgrammerAreas>
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, PartialEq, Eq, Clone)]
#[serde(crate="near_sdk::serde")]
pub struct ArtistCategoryData {
    pub area: HashSet<ArtistAreas>
}

#[derive(BorshSerialize, BorshDeserialize, Serialize, Deserialize, Clone)]
#[serde(crate="near_sdk::serde")]
pub enum Categories {
    Programmer(ProgrammerCategoryData),
    Artist(ArtistCategoryData)
}