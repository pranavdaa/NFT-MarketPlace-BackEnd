const cron = require("node-cron");
const orderService = require("../services/order");
let orderServiceInstance = new orderService();
let helper = require("../utils/helper");

cron.schedule("*/5 * * * * *", async function () {
  let orderList = await orderServiceInstance.getOrderList();

  for (order of orderList) {
    let price = await helper.getRate(order.erc20tokens.symbol);
    await orderServiceInstance.updateOrderPrice({
      orderId: order.id,
      usdPrice: price * order.usd_price,
    });
  }
});
