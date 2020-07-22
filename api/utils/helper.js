const web3 = require("web3");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
var coinMarketCapKey = "d0c9d885-8f21-4964-93d5-115af3bacf63";
const rp = require("request-promise");

function isValidEthereumAddress(address) {
  return web3.utils.isAddress(address);
}

function toChecksumAddress(address) {
  return web3.utils.toChecksumAddress(address);
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
    throw new Error("Internal Server Error");
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
};
