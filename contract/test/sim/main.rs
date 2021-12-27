// use marketplace::Marketplace;
#[path = "../../marketplace/src/lib.rs"] mod Marketplace;
#[path = "../../mediator/src/lib.rs"] mod Mediator;
use near_sdk_sim::{call, deploy, init_simulator, to_yocto, ContractAccount, UserAccount};

near_sdk_sim::lazy_static_include::lazy_static_include_bytes! {
    MEDIATOR_WASM_BYTES => "../../../out/mediator.wasm",
    MARKETPLACE_WASM_BYTES => "../../../out/marketplace.wasm",
    FT_WASM_BYTES => "../../../out/ft.wasm",
}

// #[test]
// fn simulate_increment() {
//     let root = init_simulator(None);

//     // Deploy the compiled Wasm bytes
//     let counter: ContractAccount<CounterContract> = deploy!(
//         contract: CounterContract,
//         contract_id: "counter".to_string(),
//         bytes: &COUNTER_BYTES,
//         signer_account: root
//     );

//     // Get number on account that hasn't incremented or decremented
//     let mut current_num: i8 = view!(
//         counter.get_num()
//     ).unwrap_json();
//     println!("Number before: {}", &current_num);
//     assert_eq!(&current_num, &0, "Initial number should be zero.");

//     // Call the increment function
//     call!(
//         root,
//         counter.increment()
//     ).assert_success();

//     current_num = view!(
//         counter.get_num()
//     ).unwrap_json();
//     println!("Number after first increment: {}", &current_num);
//     assert_eq!(&current_num, &1, "After incrementing, the number should be one.");

//     // Now use the non-macro approach to increment the number.
//     root.call(
//         counter.account_id(),
//         "increment",
//         &json!({})
//             .to_string()
//             .into_bytes(),
//         DEFAULT_GAS,
//         0, // attached deposit
//     ).assert_success();

//     // Similarly, use the non-macro approach to check the value.
//     current_num = root.view(
//         counter.account_id(),
//         "get_num",
//         &json!({})
//             .to_string()
//             .into_bytes(),
//     ).unwrap_json();
//     println!("Number after second increment: {}", &current_num);
//     assert_eq!(&current_num, &2, "After incrementing twice, the number should be two.");
// }