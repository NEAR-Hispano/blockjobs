/*
 * BlockJobs - Marketplace de servicios profesionales 
 * @Autores: Dario Fabian Sanchez, Sebastian Gonzalez Rada
*/

use near_contract_standards::non_fungible_token::metadata::{
    NFTContractMetadata, NonFungibleTokenMetadataProvider, TokenMetadata, NFT_METADATA_SPEC,
};
use near_contract_standards::non_fungible_token::{Token, TokenId};
use near_contract_standards::non_fungible_token::NonFungibleToken;
// Importación de Borsh para mejoras en eficiencia (http://borsh.io/)
use near_sdk::borsh::{self, BorshDeserialize, BorshSerialize};
use near_sdk::collections::{ LazyOption, LookupMap };
use near_sdk::json_types::ValidAccountId;
use near_sdk::{ env, near_bindgen, AccountId, BorshStorageKey, PanicOnDefault, Promise, 
    PromiseOrValue };
//use near_sdk::serde::{Deserialize, Serialize};
use std::default::Default;
use std::string::String;
use std::option::Option;

// mod users;
// pub use crate::users::*;
//mod mediator;

near_sdk::setup_alloc!();

#[near_bindgen]
#[derive(BorshDeserialize, BorshSerialize, PanicOnDefault)]
// TokenID según estándar NEP 171
// Los servicios ofrecidos se tratan mediante un token no fungible
pub struct Contract {
    service: NonFungibleToken,
    metadata: LazyOption<NFTContractMetadata>,
    // employees: LookupMap<AccountId, Employee>,
    // employers: LookupMap<AccountId, Employer>,
    id_counter: u32,
}

const DATA_IMAGE_SVG_NEAR_ICON: &str = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 288 288'%3E%3Cg id='l' data-name='l'%3E%3Cpath d='M187.58,79.81l-30.1,44.69a3.2,3.2,0,0,0,4.75,4.2L191.86,103a1.2,1.2,0,0,1,2,.91v80.46a1.2,1.2,0,0,1-2.12.77L102.18,77.93A15.35,15.35,0,0,0,90.47,72.5H87.34A15.34,15.34,0,0,0,72,87.84V201.16A15.34,15.34,0,0,0,87.34,216.5h0a15.35,15.35,0,0,0,13.08-7.31l30.1-44.69a3.2,3.2,0,0,0-4.75-4.2L96.14,186a1.2,1.2,0,0,1-2-.91V104.61a1.2,1.2,0,0,1,2.12-.77l89.55,107.23a15.35,15.35,0,0,0,11.71,5.43h3.13A15.34,15.34,0,0,0,216,201.16V87.84A15.34,15.34,0,0,0,200.66,72.5h0A15.35,15.35,0,0,0,187.58,79.81Z'/%3E%3C/g%3E%3C/svg%3E";

#[derive(BorshSerialize, BorshStorageKey)]
enum StorageKey {
    NonFungibleToken,
    Metadata,
    TokenMetadata,
    Enumeration,
    Approval,
}

#[near_bindgen]
// Implementación de las funciones
impl Contract {
    #[init]
    // Asigna metadata que estará por default
    pub fn new_default_metadata(owner_id: ValidAccountId) -> Self {
        Self::new(
            owner_id,
            NFTContractMetadata {
                spec: NFT_METADATA_SPEC.to_string(),
                name: "BlockJobs".to_string(),
                symbol: "BJMP".to_string(),
                icon: Some(DATA_IMAGE_SVG_NEAR_ICON.to_string()),
                base_uri: None,
                reference: None,
                reference_hash: None,
            },
        )
    }

    #[init]
    // Funcion interna que inicializa el contrato
    pub fn new(owner_id: ValidAccountId, metadata: NFTContractMetadata) -> Self {
        assert!(!env::state_exists(), "Ya inicializado");
        metadata.assert_valid();
        Self {
            service: NonFungibleToken::new(
                StorageKey::NonFungibleToken,
                owner_id,
                Some(StorageKey::TokenMetadata),
                Some(StorageKey::Enumeration),
                Some(StorageKey::Approval),
            ),
            metadata: LazyOption::new(StorageKey::Metadata, Some(&metadata)),
            // employees: LookupMap::new(b"employees".to_vec()),
            // employers: LookupMap::new(b"employers".to_vec()),
            id_counter: 0,
        }
    }

    #[payable]
    // Creación de nuevos tokens, posteriormente se limitará a usuarios que pasen un KYC
    pub fn mint_nft(
        &mut self,
        //token_id: TokenId,
        receiver_id: ValidAccountId,
        token_metadata: TokenMetadata,
    ) -> Token {
        let token_id = self.id_counter.to_string();
        self.id_counter += 1;

        // TODO(Sebas): Verificar el parametro extra de la metadata,
        // para saber que lleno toda la informacion personal requerida

        return self.service.mint(token_id, receiver_id, Some(token_metadata))
    }

    #[payable]
    // Adquisición de un servicio
    pub fn buy_nft(&mut self, token_id: TokenId) -> TokenMetadata {
        // Verificación de que el servicio exista
        assert_eq!(
            token_id.trim().parse::<u64>().unwrap() < self.service.owner_by_id.len(),
            true,
            "El ID de servicio indicado no existe"
        );
        //Obtener los metadatos del token
        let metadata = self
            .service
            .token_metadata_by_id
            .as_ref()
            .and_then(|by_id| by_id.get(&token_id))
            .unwrap();

        // //Si no cuenta con los fondos se hace rollback
        let amount = env::attached_deposit();
        // assert_eq!(
        //     metadata.price.as_ref().unwrap().parse::<u128>().unwrap(),
        //     amount,
        //     "Fondos insuficientes"
        // );
        // assert_eq!(
        //  metadata.on_sale.as_ref().unwrap(),
        //  &true,
        //  "No esta a la venta"
        // );

        //Revisa que este a la venta y obtiene el dueño del token
        let owner_id = self.service.owner_by_id.get(&token_id).unwrap();
        let buyer_id = &env::signer_account_id();
        // Verifica que quien compra no sea ya el dueño
        assert_eq!(buyer_id == &owner_id, false, "Ya es dueño del token ");
        //Cambiar la metadata
        self.service
        .token_metadata_by_id
        .as_mut()
        .and_then(|by_id| by_id.insert(&token_id, &metadata));

        /*
        let promise = Promise::new(owner_id.clone()) // Transferir al contracto que bloqueara los fondos
        .transfer(amount)
        .function_call("tx_status_callback".into(), vec![], 0, 0);
        */
        
        //Transferir los nears
        Promise::new(owner_id.clone()).transfer(amount); // Transferir al contracto que bloqueara los fondos

        //Transferir el nft
        self.service.internal_transfer_unguarded(&token_id, &owner_id, buyer_id);

        //Retornar la metadata
        return metadata
    }

    // Quitar un servicio ofrecido
    pub fn delete_nft(&mut self, token_id: TokenId) -> TokenMetadata {
        //Comprobar que el token exista
        assert_eq!(
            token_id.trim().parse::<u64>().unwrap() < self.service.owner_by_id.len(),
            true,
            "El token no existe "
        );
        //Comprobar que en caso de querer devolver el token, sea el dueño actual
        let owner_id = self.service.owner_by_id.get(&token_id).unwrap();
        assert_eq!(
            env::signer_account_id() == owner_id,
            true,
            "No es el dueño del token "
        );
        //Obtener los metadatos de ese token
        //Se utilizará posteriormente al trabajar con una API
        let metadata = self
            .service
            .token_metadata_by_id
            .as_ref()
            .and_then(|by_id| by_id.get(&token_id))
            .unwrap();
        //Cambiar la metadata
        self.service
            .token_metadata_by_id
            .as_mut()
            .and_then(|by_id| by_id.insert(&token_id, &metadata));
        //Retornar la metadata
        metadata
    }

    // Consultar servicios disponibles de determinado profesional
    pub fn tokens_of(
        &self,
        account_id: ValidAccountId,
        from_index: U128,
        limit: u64,
    ) -> Vec<Token> {
        return self
            .service
            .nft_tokens_for_owner(account_id, Some(from_index), Some(limit));
    }

    //, category: Categories
    // pub fn new_professional(&mut self, active: bool, categories: String) -> Employee{
        // let sender = env::predecessor_account_id();

        // TODO(Sebas): bs58::encode(env::sha256(&env::random_seed())).into_string(); Esto sirve para generar uui
        // TODO(Sebas): Verificar que no repitan las categorias aqui, en el front o ambos?
        // let new_employee = Employee {
        //     account_id: sender.clone(),
        //     active: active,
        //     categories: categories,
        //     rep: 0
        // };
        // self.employees.insert( 
        //     &sender,
        //     &new_employee
        // );
    
        // return new_employee;
    // } 
    
    //Agrega nuevos empleadores o clientes
    // pub fn new_employer(&mut self, searching: bool) -> Employer{
    //     let sender = env::predecessor_account_id();

    //     let new_employer = Employer {
    //         account_id: sender.clone(),
    //         rep: 0,
    //         searching: true
    //     };

    //     self.employers.insert( 
    //         &sender,
    //         &new_employer
    //     );

    //     return new_employer;
    // }
}


#[near_bindgen]
impl NonFungibleTokenMetadataProvider for Contract {
    fn nft_metadata(&self) -> NFTContractMetadata {
        self.metadata.get().unwrap()
    }
}

near_contract_standards::impl_non_fungible_token_core!(Contract, service);
near_contract_standards::impl_non_fungible_token_approval!(Contract, service);
near_contract_standards::impl_non_fungible_token_enumeration!(Contract, service);


// Inicio de los tests unitarios
#[cfg(all(test, not(target_arch = "wasm32")))]
mod tests {
    use near_sdk::test_utils::{accounts, VMContextBuilder};
    use near_sdk::testing_env;

    use super::*;

    const MINT_STORAGE_COST: u128 = 5870000000000000000000;

    fn get_context(predecessor_account_id: ValidAccountId) -> VMContextBuilder {
        let mut builder = VMContextBuilder::new();
        builder
            .current_account_id(accounts(0))
            .signer_account_id(predecessor_account_id.clone())
            .predecessor_account_id(predecessor_account_id);
        builder
    }

    //Datos para la función inicializadora
    fn sample_token_metadata() -> TokenMetadata {
        TokenMetadata {
            title: Some(" ".into()),
            description: Some(" ".into()),
            media: None,
            media_hash: None,
            copies: Some(1u64),
            issued_at: None,
            expires_at: None,
            starts_at: None,
            updated_at: None,
            extra: None,
            reference: None,
            reference_hash: None,      }
    }

    //Test de la función inicializadora
    #[test]
    fn test_new() {
        let mut context = get_context(accounts(1));
        testing_env!(context.build());
        let contract = Contract::new_default_metadata(accounts(1).into());
        testing_env!(context.is_view(true).build());
        assert_eq!(contract.nft_token("1".to_string()), None);
    }

    //Verificación del contrato
    #[test]
    #[should_panic(expected = "El contrato no está inicializado")]
    fn test_default() {
        let context = get_context(accounts(1));
        testing_env!(context.build());
        let _contract = Contract::default();
    }

    //Verificación de la creación de un servicio
    #[test]
    fn test_mint() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_metadata(accounts(0).into());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(MINT_STORAGE_COST)
            .predecessor_account_id(accounts(0))
            .build());

        let token_id = "0".to_string();
        let token = contract.mint_nft(accounts(0), sample_token_metadata());
        assert_eq!(token.token_id, token_id);
        assert_eq!(token.owner_id, accounts(0).to_string());
        assert_eq!(token.metadata.unwrap(), sample_token_metadata());
        assert_eq!(token.approved_account_ids.unwrap(), HashMap::new());
    }

    //Prueba de una transferencia entre profesional y cliente
    #[test]
    fn test_transfer() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_metadata(accounts(0).into());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(MINT_STORAGE_COST)
            .predecessor_account_id(accounts(0))
            .build());
        let token_id = "0".to_string();
        contract.mint_nft(accounts(0), sample_token_metadata());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(1)
            .predecessor_account_id(accounts(0))
            .build());
        contract.nft_transfer(accounts(1), token_id.clone(), None, None);

        testing_env!(context
            .storage_usage(env::storage_usage())
            .account_balance(env::account_balance())
            .is_view(true)
            .attached_deposit(0)
            .build());
        if let Some(token) = contract.nft_token(token_id.clone()) {
            assert_eq!(token.token_id, token_id);
            assert_eq!(token.owner_id, accounts(1).to_string());
            assert_eq!(token.metadata.unwrap(), sample_token_metadata());
            assert_eq!(token.approved_account_ids.unwrap(), HashMap::new());
        } else {
            panic!("El token no se ha creado");
        }
    }

    //Verificación de servicio a la venta
    #[test]
    fn test_approve() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_metadata(accounts(0).into());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(MINT_STORAGE_COST)
            .predecessor_account_id(accounts(0))
            .build());
        let token_id = "0".to_string();
        contract.mint_nft(accounts(0), sample_token_metadata());

        // Puesta en venta de un servicio
        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(150000000000000000000)
            .predecessor_account_id(accounts(0))
            .build());
        contract.nft_approve(token_id.clone(), accounts(1), None);

        testing_env!(context
            .storage_usage(env::storage_usage())
            .account_balance(env::account_balance())
            .is_view(true)
            .attached_deposit(0)
            .build());
        assert!(contract.nft_is_approved(token_id.clone(), accounts(1), Some(1)));
    }

    //Prueba de quitar un servicio por parte del profesional
    #[test]
    fn test_revoke() {
        let mut context = get_context(accounts(0));
        testing_env!(context.build());
        let mut contract = Contract::new_default_metadata(accounts(0).into());

        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(MINT_STORAGE_COST)
            .predecessor_account_id(accounts(0))
            .build());
        let token_id = "0".to_string();
        contract.mint_nft(accounts(0), sample_token_metadata());

        // Servicio en venta
        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(150000000000000000000)
            .predecessor_account_id(accounts(0))
            .build());
        contract.nft_approve(token_id.clone(), accounts(1), None);

        // Servicio fuera de venta
        testing_env!(context
            .storage_usage(env::storage_usage())
            .attached_deposit(1)
            .predecessor_account_id(accounts(0))
            .build());
        contract.nft_revoke(token_id.clone(), accounts(1));
        testing_env!(context
            .storage_usage(env::storage_usage())
            .account_balance(env::account_balance())
            .is_view(true)
            .attached_deposit(0)
            .build());
        assert!(!contract.nft_is_approved(token_id.clone(), accounts(1), None));
    }

}