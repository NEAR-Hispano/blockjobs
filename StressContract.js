import * as nearAPI from "near-api-js";

const { keyStores } = nearAPI;
const keyStore = new keyStores.BrowserLocalStorageKeyStore();

const { connect, keyStores, WalletConnection } = nearAPI;

const config = {
  networkId: "testnet",
  keyStore: new keyStores.BrowserLocalStorageKeyStore(),
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};

// connect to NEAR
const near = await connect(config);

// create wallet connection
const wallet = new WalletConnection(near);

console.log(process.env.CONTRACT_NAME);

const account = await near.account(process.env.CONTRACT_NAME);
// await account.createAccount(
//   "example-account2.testnet", // new account name
//   "8hSHprDq2StXwMtNd43wDTXQYsjXcD4MJTXQYsjXcc", // public key for new account
//   "10000000000000000000" // initial balance for new account in yoctoNEAR
// );

const contract = new nearAPI.Contract(
    account, // the account object that is connecting
    "example-contract.testnet",
    {
      // name of contract you're connecting to
    //   viewMethods: ["getMessages"], // view methods do not change state but usually return a value
    //   changeMethods: ["addMessage"], // change methods modify state
      sender: account, // account object to initialize and sign transactions.
    }
);