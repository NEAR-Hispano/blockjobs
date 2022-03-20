use std::fmt::Display;
use near_sdk::serde::{Deserialize, Serialize};
// use serde_with::skip_serializing_none;

// #[derive(Serialize, Deserialize, Debug)]
// #[serde(rename_all = "snake_case")]
// pub enum NearEvent {
//     Service(Event),
//     User(Event),
// }

// #[derive(Serialize, Deserialize, Debug)]
// pub struct Event {
//     #[serde(flatten)]
//     event_kind: EventKind,
// }

#[derive(Serialize, Deserialize, Debug)]
#[serde(rename_all = "snake_case")]
// #[serde(tag = "event", content = "data")]
// #[allow(clippy::enum_variant_names)]
pub enum NearEvent {
    ServiceMint(ServiceMintData),
    ServiceBuy(ServiceBuyData),
    ServiceReclaim(ServiceReclaimData),
    ServiceReturn(ServiceReturnData),
    ServiceUpdateMetadata(ServiceUpdateMetadataData),
    ServiceUpdateDuration(ServiceUpdateDurationData),
    ServiceUpdateOnSale(ServiceUpdateOnSaleData),
    UserNew(UserNewData),
    UserUpdateRoles(UserUpdateRolesData),
    UserUpdateDates(UserUpdateDatesData),
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ServiceMintData {
    id: String,
    creator_id: String,
    title: String,
    description: String,
    categories: String,
    price: String,
    duration: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ServiceBuyData {id: String, buyer_id: String}

#[derive(Serialize, Deserialize, Debug)]
pub struct ServiceReclaimData {id: String, sender_id: String}

#[derive(Serialize, Deserialize, Debug)]
pub struct ServiceReturnData {id: String, creator_id: String}

#[derive(Serialize, Deserialize, Debug)]
pub struct ServiceUpdateMetadataData {
    id: String,
    title: String,
    description: String,
    categories: String,
    price: String,
    duration: String,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct ServiceUpdateDurationData {id: String, new_duration: String}

#[derive(Serialize, Deserialize, Debug)]
pub struct ServiceUpdateOnSaleData {id: String, on_sale: String}

// #[skip_serializing_none]
#[derive(Serialize, Deserialize, Debug)]
pub struct UserNewData {id: String, roles: String, data: Option<String>, reputation: String, banned: String}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserUpdateRolesData {id: String, roles: String}

#[derive(Serialize, Deserialize, Debug)]
pub struct UserUpdateDatesData {id: String, data: String}


impl NearEvent {
    // Minteo de uno o mas servicios.
    pub fn log_service_mint(
        id: String, 
        creator_id: String, 
        title: String,
        description: String,
        categories: String,
        price: String, 
        duration: String,) 
    {
        let data = ServiceMintData {
            id, creator_id, title, description, categories, price, duration}
        ;
        NearEvent::ServiceMint(data).log();
    }

    // Compra de un servicio.
    pub fn log_service_buy(id: String,  buyer_id: String) {
        let data = ServiceBuyData {id, buyer_id};
        NearEvent::ServiceBuy(data).log();
    }

    // Reclamo de un servicio por parte del profesional.
    pub fn log_service_reclaim(id: String,  sender_id: String) {
        let data = ServiceReclaimData {id, sender_id};
        NearEvent::ServiceReclaim(data).log();
    }

    // Retorno de un servicio por parte de un Admin.
    pub fn log_service_return(id: String,  creator_id: String) {
        let data = ServiceReturnData {id, creator_id};
        NearEvent::ServiceReturn(data).log();
    }

    // TODO segmentar la metadata
    // Update de la metadata de un servicio por parte del profesional.
    pub fn log_service_update_metadata(
        id: String, 
        title: String,
        description: String,
        categories: String,
        price: String, 
        duration: String,) 
    {
        let data = ServiceUpdateMetadataData {
            id, title, description, categories, price, duration}
        ;
        NearEvent::ServiceUpdateMetadata(data).log();
    }

    // Update de la duracion de un servicio por parte del profesional.
    pub fn log_service_update_duration(id: String,  new_duration: String) {
        let data = ServiceUpdateDurationData {id, new_duration};
        NearEvent::ServiceUpdateDuration(data).log();
    }

    // Update de si un servicio esta o no en venta por parte del profesional.
    pub fn log_service_update_on_sale(id: String,  on_sale: String) {
        let data = ServiceUpdateOnSaleData {id, on_sale};
        NearEvent::ServiceUpdateOnSale(data).log();
    }


    // Registro de un nuevo usuario.
    pub fn log_user_new(id: String, roles: String, data: Option<String>, reputation: String, banned: String) {
        let data = UserNewData {id, roles, data, reputation, banned};
        NearEvent::UserNew(data).log();
    }

    // Modificar la data de un usuario.
    pub fn log_user_update_data(id: String, data: String) {
        let data = UserUpdateDatesData {id, data};
        NearEvent::UserUpdateDates(data).log();
    }

    // Modificar los roles de un usuario.
    pub fn log_user_update_roles(id: String, roles: String) {
        let data = UserUpdateRolesData {id, roles};
        NearEvent::UserUpdateRoles(data).log();
    }


    // Funciones internas.
    fn log(&self) {
        near_sdk::env::log(&self.to_string().as_bytes());
    }

    pub(crate) fn to_json_string(&self) -> String {
        serde_json::to_string(self).unwrap()
    }    
}

impl Display for NearEvent {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.write_str(&format!("EVENT_JSON:{}", self.to_json_string()))
    }
}

// #[cfg(test)]
// mod tests {
//     use super::*;

//     fn make_tokens(s_vec: Vec<&str) -> String> {
//         s_vec.iter().map(|t| t.to_string()).collect()
//     }

//     #[test]
//     fn service_mint() {
//         let owner_id = "bob".to_string();
//         let token_ids = make_tokens("0", "1"]);
//         let mint_log = ServiceMintData { owner_id, token_ids, memo: None };
//         let event_log = NearEvent::service_mint(mint_log]);
//         assert_eq!(
//             serde_json::to_string(&event_log).unwrap(),
//             r#"{"standard":"nep171","version":"1.0.0","event":"service_mint","data":[{"owner_id":"bob","token_ids":["0","1"]}]}"#
//         );
//     }

//     #[test]
//     fn service_mints() {
//         let owner_id = "bob".to_string();
//         let token_ids = make_tokens("0", "1"]);
//         let mint_log = ServiceMintData { owner_id, token_ids, memo: None };
//         let event_log = NearEvent::service_mint(
//             mint_log,
//             ServiceMintData {
//                 owner_id: "alice".to_string(),
//                 token_ids: make_tokens("2", "3"]),
//                 memo: Some("has memo".to_string()),
//             },
//         ]);
//         assert_eq!(
//             serde_json::to_string(&event_log).unwrap(),
//             r#"{"standard":"nep171","version":"1.0.0","event":"service_mint","data":[{"owner_id":"bob","token_ids":["0","1"]},{"owner_id":"alice","token_ids":["2","3"],"memo":"has memo"}]}"#
//         );
//     }

//     #[test]
//     fn service_buy() {
//         let owner_id = "bob".to_string();
//         let token_ids = make_tokens("0", "1"]);
//         let log = NearEvent::service_buy(ServiceBuyData {
//             owner_id,
//             authorized_id: None,
//             token_ids,
//             memo: None,
//         }])
//             .to_json_string();
//         assert_eq!(
//             log,
//             r#"{"standard":"nep171","version":"1.0.0","event":"service_buy","data":[{"owner_id":"bob","token_ids":["0","1"]}]}"#
//         );
//     }

//     #[test]
//     fn service_buys() {
//         let owner_id = "bob".to_string();
//         let token_ids = make_tokens("0", "1"]);
//         let log = NearEvent::service_buy(
//             ServiceBuyData {
//                 owner_id: "alice".to_string(),
//                 authorized_id: Some("4".to_string()),
//                 token_ids: make_tokens("2", "3"]),
//                 memo: Some("has memo".to_string()),
//             },
//             ServiceBuyData { owner_id, authorized_id: None, token_ids, memo: None },
//         ])
//             .to_json_string();
//         assert_eq!(
//             log,
//             r#"{"standard":"nep171","version":"1.0.0","event":"service_buy","data":[{"authorized_id":"4","owner_id":"alice","token_ids":["2","3"],"memo":"has memo"},{"owner_id":"bob","token_ids":["0","1"]}]}"#
//         );
//     }

//     #[test]
//     fn service_reclaim() {
//         let old_owner_id = "bob".to_string();
//         let new_owner_id = "alice".to_string();
//         let token_ids = make_tokens("0", "1"]);
//         let log = NearEvent::service_reclaim(ServiceReclaimData {
//             old_owner_id,
//             new_owner_id,
//             authorized_id: None,
//             token_ids,
//             memo: None,
//         }])
//             .to_json_string();
//         assert_eq!(
//             log,
//             r#"{"standard":"nep171","version":"1.0.0","event":"service_reclaim","data":[{"old_owner_id":"bob","new_owner_id":"alice","token_ids":["0","1"]}]}"#
//         );
//     }

//     #[test]
//     fn service_reclaims() {
//         let old_owner_id = "bob";
//         let new_owner_id = "alice";
//         let token_ids = make_tokens("0", "1"]);
//         let log = NearEvent::service_reclaim(
//             ServiceReclaimData {
//                 old_owner_id: new_owner_id.to_string(),
//                 new_owner_id: old_owner_id.to_string(),
//                 authorized_id: Some("4".to_string()),
//                 token_ids: make_tokens("2", "3"]),
//                 memo: Some("has memo".to_string()),
//             },
//             ServiceReclaimData {
//                 old_owner_id: old_owner_id.to_string(),
//                 new_owner_id: new_owner_id.to_string(),
//                 authorized_id: None,
//                 token_ids,
//                 memo: None,
//             },
//         ])
//             .to_json_string();
//         assert_eq!(
//             log,
//             r#"{"standard":"nep171","version":"1.0.0","event":"service_reclaim","data":[{"authorized_id":"4","old_owner_id":"alice","new_owner_id":"bob","token_ids":["2","3"],"memo":"has memo"},{"old_owner_id":"bob","new_owner_id":"alice","token_ids":["0","1"]}]}"#
//         );
//     }
// }