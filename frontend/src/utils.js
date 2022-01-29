import { connect, Contract, keyStores, WalletConnection, utils } from "near-api-js"
import { toast } from "react-toastify";
import { async } from "regenerator-runtime";
import getConfig from "./config"
import { NFTStorage, File } from 'nft.storage'
// import { pack } from 'ipfs-car/pack';

const nearConfig = getConfig(process.env.NODE_ENV || "development")

// Initialize contract & set global variables
export async function initContract() {
  let keystore = new keyStores.BrowserLocalStorageKeyStore();
  nearConfig.keyStore = keystore;
 
  // Initialize connection to the NEAR testnet
  const near = await connect(Object.assign({ deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } }, nearConfig))

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near)

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId()

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(window.walletConnection.account(), nearConfig.contractName, {
    // View methods are read only. They don't modify the state, but usually return some value.
    viewMethods: [
      "get_user",
      "get_users_by_role",
      "get_service_by_id",
      "get_service_by_ids",
      "get_user_services",
      "get_user_service_id",
      "get_total_services",
      "get_services",
    ],
    // Change methods can modify the state. But you don"t receive the returned value when called.
    changeMethods: [
      "add_user",
      "update_user_categories",
      "set_user_role",
      "mint_service",
      "buy_service",
      "reclaim_dispute",
      "reclaim_service",
      "reclaim_service_test",
      "update_user_data",
      "update_service",
      "update_service_on_sale",
      "return_service_by_admin",
    ],
    sender: nearConfig.contractName
  })

  window.nftStorageClient = new NFTStorage({ token: String(process.env.NFT_STORAGE_API_KEY) })
}

export function logout() {
  window.walletConnection.signOut()
  // reload page
  window.location.replace(window.location.origin + window.location.pathname)
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user"s behalf.
  // This works by creating a new access key for the user"s account and storing
  // the private key in localStorage.
  window.walletConnection.requestSignIn(nearConfig.contractName)
}

function getErrMsg(e) {
  let finalErrorMsg = String(e.message.match("\".*\""))
  return finalErrorMsg.substring(1, finalErrorMsg.length - 1) 
}

/* Services relate */

export async function mintService(serviceMetadata, amountOfServices, durationService, amt) {
  try {
    return await window.contract.mint_service({ metadata: serviceMetadata, quantity: amountOfServices, duration: durationService }, "300000000000000", amt);
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}

export async function buyService(serviceId, deposit) {
  try {
    await window.contract.buy_service({service_id: serviceId}, "300000000000000", deposit)
    return true
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return false
  }
}

export async function updateService(serviceId, serviceMetadata, durationService, amt) {
  try {
    await window.contract.update_service({service_id: serviceId, metadata: serviceMetadata, duration: durationService}, "300000000000000", amt)
    return true
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return false
  }
}

export async function reclaimService() {
  // let fee = utils.format.parseNearAmount("0.1");
  try {
    await window.contract.reclaim_service({service_id: serviceId}, "300000000000000")
    return true
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return false
  }
}
export async function reclaimServiceTest(serviceId) {
  // let fee = utils.format.parseNearAmount("0.1");
  try {
    await window.contract.reclaim_service_test({service_id: serviceId}, "300000000000000")
    return true
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return false
  }
}

export async function getUserServices(serviceId) {
  try {
    return await window.contract.get_user_services({account_id: window.accountId, only_on_sale: false})
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}

export async function getServiceById(id) {
  try {
    return await window.contract.get_service_by_id({service_id: id})
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}

export async function getServices(index, limit) {
  try {
    return await window.contract.get_services({from_index: index, limit: limit})
      
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}

/* User relate */

export async function addUser(roles, personalData) {
  let amt = utils.format.parseNearAmount("0.1");
  try {
    return await window.contract.add_user({ roles: roles, personal_data: personalData }, "300000000000000", amt);
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}

export async function updateUserData(roles, data) {
  let amt = utils.format.parseNearAmount("0.1");
  try {
    return await window.contract.update_user_data({roles: roles, data: data}, "300000000000000", amt)
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}

export async function getUser(accountId) {
  try {
    return await window.contract.get_user({ account_id: accountId})
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}
