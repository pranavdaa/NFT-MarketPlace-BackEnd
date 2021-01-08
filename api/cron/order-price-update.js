const cron = require("node-cron");
const orderService = require("../services/order");
let orderServiceInstance = new orderService();
let helper = require("../utils/helper");

cron.schedule("*/59 29 * * * *", async function () {
  let tokenList = await orderServiceInstance.getERC20TokenList();

  for (token of tokenList) {
    let price = await helper.getRate(token.symbol);
    await erc20TokenServiceInstance.updateERC20Token({
      id: token.id,
      market_price: price,
    });
  }
});
