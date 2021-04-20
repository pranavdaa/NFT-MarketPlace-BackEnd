const cron = require("node-cron");
const orderService = require("../services/order");
let orderServiceInstance = new orderService();
let helper = require("../utils/helper");

cron.schedule("*/59 * * * * *", async function () {
  let orderList = await orderServiceInstance.getOrderList();
  let weth_price = await helper.getRate("WETH");
  let dai_price = await helper.getRate("DAI");

  for (order of orderList) {
    let price;
    if (order.erc20tokens.symbol === "WETH") {
      price = weth_price;
    } else {
      price = dai_price;
    }

    await orderServiceInstance.updateOrderPrice({
      orderId: order.id,
      usdPrice: price * order.price,
    });
  }
});
