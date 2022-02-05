import { connect, Contract, keyStores, WalletConnection, utils } from "near-api-js"
import { toast } from "react-toastify";
import getConfig from "./config"
import { NFTStorage } from 'nft.storage'
import contractsAccounts from "./contractsAccounts.json"

const marketplaceConfig = getConfig(process.env.NODE_ENV || "development", contractsAccounts.MARKETPLACE_CONTRACT)
const mediatorConfig = getConfig(process.env.NODE_ENV || "development", contractsAccounts.MEDIATOR_CONTRACT)
const ftConfig = getConfig(process.env.NODE_ENV || "development", contractsAccounts.FT_CONTRACT)

// Initialize contract & set global variables
export async function initContract() {
  let keystore = new keyStores.BrowserLocalStorageKeyStore();
  marketplaceConfig.keyStore = keystore;
  mediatorConfig.keyStore = keystore;
  ftConfig.keyStore = keystore;
 
  // Initialize connection to the NEAR testnet
  const near = await connect(Object.assign({ deps: { keyStore: keystore } }, marketplaceConfig))

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near)

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId()

  // Initializing our contract APIs by contract name and configuration
  window.contract = await new Contract(window.walletConnection.account(), marketplaceConfig.contractName, {
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
    sender: marketplaceConfig.contractName
  })

  window.contract2 = await new Contract(window.walletConnection.account(), mediatorConfig.contractName, {
    viewMethods: [
      "get_dispute",
      "get_disputes",
      "get_total_disputes",
      "get_max_jurors"
    ],
    changeMethods: [
      "update_dispute_status",
      "add_accused_proves",
      "pre_vote",
      "vote"
    ],
    sender: mediatorConfig.contractName
  })

  window.contract3 = await new Contract(window.walletConnection.account(), mediatorConfig.contractName, {
    viewMethods: [
      "get_total_supply",
      "get_balance_of",
      "get_minter",
      "get_pending_to_mint",
      "get_allowance_of",
      "verify_blocked_amount",
    ],
    changeMethods: [
      "mint",
      "mint_test",
      "transfer_tokens",
      "block_tokens",
      "withdraw_tokens",
    ],
    sender: ftConfig.contractName
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
  window.walletConnection.requestSignIn(marketplaceConfig.contractName)
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

export async function reclaimDispute(serviceId, proves) {
  try {
    let amt = utils.format.parseNearAmount("0.1");
    return await window.contract.reclaim_dispute({ service_id: serviceId, proves: proves}, "300000000000000", amt)
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}
export async function addAccusedProves(disputeId, proves) {
  try {
    // let amt = utils.format.parseNearAmount("0.1");
    return await window.contract2.add_accused_proves({ dispute_id: disputeId, accused_proves: proves}, "300000000000000")
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}

export async function updateDisputeStatus(disputeId) {
  try {
    return await window.contract2.update_dispute_status({dispute_id: disputeId}, "300000000000000")
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}

export async function preVote(disputeId) {
  try {
    return await window.contract2.pre_vote({dispute_id: disputeId}, "300000000000000")
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}

export async function vote(disputeId, vote) {
  try {
    return await window.contract2.vote({dispute_id: disputeId, vote: vote}, "300000000000000")
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}

export async function getDisputes(fromIndex, limit) {
  try {
    return await window.contract2.get_disputes({ from_index: fromIndex, limit: limit})
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}

export async function getDispute(disputeId) {
  try {
    return await window.contract2.get_dispute({dispute_id: disputeId})
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}

export async function getMaxJurors() {
  try {
    return await window.contract2.get_max_jurors()
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}

export async function mintTest(receiver) {
  try {
    return await window.contract3.mint_test({receiver: receiver})
  } catch(e) {
    let finalErrorMsg = getErrMsg(e)
    toast.error(finalErrorMsg)
    console.log(e)
    return null
  }
}