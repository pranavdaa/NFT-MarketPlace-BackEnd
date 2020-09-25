const cron = require("node-cron");
const orderService = require("../services/order");
let orderServiceInstance = new orderService();

cron.schedule("*/59 4 * * * *", async function () {
  let ordersList = await orderServiceInstance.getAuctionOrders();

  for (order of ordersList) {
    if (Date.now() >= order.expiry_date.getTime()) {
      orderServiceInstance.expireOrder({ orderId: order.id });
    }
  }
});
