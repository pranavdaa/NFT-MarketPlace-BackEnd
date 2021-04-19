const orderService = require("../api/services/order");
let orderServiceInstance = new orderService();
const TokenService = require("../api/services/tokens");
const tokenServiceInstance = new TokenService();

async function tokenMigrate() {
  let orderList = await orderServiceInstance.getFullOrderList();

  for (order of orderList) {
    try {
      let token = await tokenServiceInstance.getToken({
        token_id: order.tokens_id,
        category_id: order.categories.id,
      });

      if (token) {
        token = await tokenServiceInstance.updateToken({
          token_id: order.tokens_id,
          category_id: order.categories.id,
          name_lowercase: token.name ? token.name.toLowerCase() : "",
        });
        console.log("updated");
      }
      console.log(order.id);
    } catch (err) {
      console.log(err);
      console.log("error in ", order.id);
    }
  }
}

tokenMigrate()
  .then(() => {
    console.log("success");
  })
  .catch((err) => {
    console.log(err);
  });
