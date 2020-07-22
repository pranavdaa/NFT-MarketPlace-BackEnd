const web3 = require("web3");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
let config = require("../../config/config");
var coinMarketCapKey = config.coinmarket_apikey;
const rp = require("request-promise");
let constants = require("../../config/constants");

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

module.exports = {
  hasNextPage,
  isValidEthereumAddress,
  notify,
  getRate,
  toChecksumAddress,
  toNumber,
  toHex,
};
