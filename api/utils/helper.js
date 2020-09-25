let Web3 = require("web3");
let artifacts = require("./artifacts.json");
const provider = new Web3.providers.HttpProvider(
  "https://rpc-mumbai.matic.today"
);
let { exchangeDataEncoder } = require("@0x/contracts-exchange");
const web3 = new Web3(provider);
const root_provider = new Web3.providers.HttpProvider(
  "https://goerli.infura.io/v3/7ff035fb434149dd8a9b1dc106b6905a"
);
let { BigNumber, providerUtils } = require("@0x/utils");
const root_web3 = new Web3(root_provider);
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
let config = require("../../config/config");
var coinMarketCapKey = config.coinmarket_apikey;
const rp = require("request-promise");
let constants = require("../../config/constants");
let {
  MnemonicWalletSubprovider,
  RPCSubprovider,
  Web3ProviderEngine,
} = require("@0x/subproviders");

function isValidEthereumAddress(address) {
  return web3.utils.isAddress(address);
}

function toChecksumAddress(address) {
  return web3.utils.toChecksumAddress(address);
}

function toNumber(tokenId) {
  return web3.utils.hexToNumberString(tokenId);
}

function toHex(value) {
  return web3.utils.numberToHex(value);
}

function hasNextPage({ limit, offset, count }) {
  // accepts options with keys limit, offset, count
  if (offset + limit >= count) {
    return false;
  }
  return true;
}

async function notify({ userId, message, order_id }) {
  try {
    let notification = await prisma.notifications.create({
      data: {
        users: { connect: { id: parseInt(userId) } },
        message,
        orders: { connect: { id: parseInt(order_id) } },
      },
    });

    return notification;
  } catch (err) {
    console.log(err);
    throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
  }
}

var getRate = async function (symbol) {
  try {
    const requestOptions = {
      method: "GET",
      uri:
        "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
      qs: {
        start: "1",
        limit: "1000",
        convert: "USD",
      },
      headers: {
        "X-CMC_PRO_API_KEY": coinMarketCapKey,
      },
      json: true,
      gzip: true,
    };

    var response = await rp(requestOptions);
    var detailsArray = response.data;
    let result;

    for (detail of detailsArray) {
      if (detail.symbol === symbol) {
        result = detail.quote["USD"].price;
      }
    }

    return result;
  } catch (err) {
    console.log(err.message);
  }
};

async function ethereum_balance(owner, rootContractAddress) {
  const rootContractInstance = new root_web3.eth.Contract(
    artifacts.pos_RootERC721,
    rootContractAddress
  );
  let balance = await rootContractInstance.methods.balanceOf(owner).call();

  let token_array = [];

  for (i = 0; i < balance; i++) {
    let tokenId = await rootContractInstance.methods
      .tokenOfOwnerByIndex(owner, i)
      .call();

    let uri = await rootContractInstance.methods.tokenURI(tokenId).call();

    token_array.push({
      contract: rootContractAddress,
      token_id: tokenId,
      owner: owner,
      uri: uri,
    });
  }
  return token_array;
}

async function matic_balance(owner, childContractAddress) {
  const childContractInstance = new web3.eth.Contract(
    artifacts.pos_ChildERC721,
    childContractAddress
  );

  let balance = await childContractInstance.methods.balanceOf(owner).call();

  let token_array = [];

  for (i = 0; i < balance; i++) {
    let tokenId = await childContractInstance.methods
      .tokenOfOwnerByIndex(owner, i)
      .call();

    let uri = await childContractInstance.methods.tokenURI(tokenId).call();

    token_array.push({
      contract: childContractAddress,
      token_id: tokenId,
      owner: owner,
      uri: uri,
    });
  }
  return token_array;
}

async function matic_nft_detail(tokenId, childContractAddress) {
  const childContractInstance = new web3.eth.Contract(
    artifacts.pos_ChildERC721,
    childContractAddress
  );

  let owner = await childContractInstance.methods.ownerOf(tokenId).call();
  let uri = await childContractInstance.methods.tokenURI(tokenId).call();

  token_detail = {
    contract: childContractAddress,
    token_id: tokenId,
    owner: owner,
    uri: uri,
  };

  return token_detail;
}

async function ethereum_nft_detail(tokenId, rootContractAddress) {
  const rootContractInstance = new root_web3.eth.Contract(
    artifacts.pos_RootERC721,
    rootContractAddress
  );

  let owner = await rootContractInstance.methods.ownerOf(tokenId).call();
  let uri = await rootContractInstance.methods.tokenURI(tokenId).call();

  token_detail = {
    contract: rootContractAddress,
    token_id: tokenId,
    owner: owner,
    uri: uri,
  };

  return token_detail;
}

function getSignatureParameters(signature) {
  if (!web3.utils.isHexStrict(signature)) {
    throw new Error(
      'Given value "'.concat(signature, '" is not a valid hex string.')
    );
  }
  var r = signature.slice(0, 66);
  var s = "0x".concat(signature.slice(66, 130));
  var v = "0x".concat(signature.slice(130, 132));
  v = web3.utils.hexToNumber(v);
  if (![27, 28].includes(v)) v += 27;
  return { r, s, v };
}

/**
 * extracts r,s,v params from the given signature, constructs a function call to `executeMetaTransaction` function on the smart contract and executes it. The execution happens on Mumbai (80001) chain
 * txDetails = { intent, fnSig, from, contractAddress }
 * @param {object} txDetails transaction object that will be executed on 80001 chain
 */
async function executeMetaTransaction(txDetails) {
  const { r, s, v } = getSignatureParameters(txDetails.intent);
  const inputs = [
    { name: "userAddress", type: "address" },
    { name: "functionSignature", type: "bytes" },
    { name: "sigR", type: "bytes32" },
    { name: "sigS", type: "bytes32" },
    { name: "sigV", type: "uint8" },
  ];

  if (!isValidEthereumAddress(txDetails.from)) {
    console.log("`from` not valid account address");
    throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
  }

  const data = web3.eth.abi.encodeFunctionCall(
    {
      name: "executeMetaTransaction",
      type: "function",
      inputs,
    },
    [txDetails.from, txDetails.fnSig, r, s, v]
  );
  // add private key
  web3.eth.accounts.wallet.add(config.admin_private_key);
  let execution;
  try {
    execution = await web3.eth.sendTransaction({
      from: web3.eth.accounts.wallet[0].address,
      data,
      to: txDetails.contractAddress,
      gas: 80000,
    });
  } catch (err) {
    console.log(err);
    throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
  }
  return execution;
}

const calculateProtocolFee = (
  orders,
  gasPrice = constants.ZERO_EX.GAS_PRICE
) => {
  return new BigNumber(150000).times(gasPrice).times(orders.length);
};

const providerEngine = () => {
  const mnemonicWallet = new MnemonicWalletSubprovider({
    mnemonic: config.MNEMONIC,
    baseDerivationPath: constants.ZERO_EX.BASE_DERIVATION_PATH,
  });
  const pe = new Web3ProviderEngine();
  pe.addProvider(mnemonicWallet);
  pe.addProvider(new RPCSubprovider(constants.ZERO_EX.RPC_URL));
  providerUtils.startProviderEngine(pe);
  return pe;
};

const encodeExchangeData = (signedOrder, functionName) => {
  signedOrder.takerAssetAmount = new BigNumber(signedOrder.takerAssetAmount);
  let data = exchangeDataEncoder.encodeOrdersToExchangeData(functionName, [
    signedOrder,
  ]);
  return data;
};

module.exports = {
  hasNextPage,
  isValidEthereumAddress,
  notify,
  getRate,
  toChecksumAddress,
  toNumber,
  toHex,
  matic_balance,
  ethereum_balance,
  matic_nft_detail,
  ethereum_nft_detail,
  executeMetaTransaction,
  calculateProtocolFee,
  providerEngine,
  encodeExchangeData,
};
