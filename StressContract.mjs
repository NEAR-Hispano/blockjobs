import * as nearAPI from "near-api-js";
import path from "path";
import os from "os";

function broofa() {
    return 'xxxxxxxxxxxxxyxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16).toLowerCase();
    });
}

const homedir = os.homedir();

let { connect, KeyPair, keyStores } = nearAPI;
const CREDENTIALS_DIR = ".near-credentials";
const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

const config = {
  keyStore,
  networkId: "testnet",
  nodeUrl: "https://rpc.testnet.near.org",
  walletUrl: "https://wallet.testnet.near.org",
  helperUrl: "https://helper.testnet.near.org",
  explorerUrl: "https://explorer.testnet.near.org",
};

// const near = await connect(config);

const near = await connect(config);
let account = await near.account("stolkerve.testnet");


for (let index = 0; index < 10; index++) {
    const keyPair = KeyPair.fromRandom("ed25519");
    console.log(keyPair)
    const publicKey = keyPair.publicKey.toString();
    console.log(publicKey)
    await account.createAccount(
        `pruebadeblogjobs.testnet`, // new account name
        publicKey, // public key for new account
        "1000000000000000000" // initial balance for new account in yoctoNEAR
    );
    
}