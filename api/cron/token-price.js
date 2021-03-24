const cron = require("node-cron");
const erc20TokenService = require("../services/erc20-token");
let erc20TokenServiceInstance = new erc20TokenService();
let helper = require("../utils/helper");

cron.schedule("*/59 29 * * * *", async function () {
  let tokenList = await erc20TokenServiceInstance.getERC20TokenList();
  let weth_price = await helper.getRate("WETH");
  let dai_price = await helper.getRate("DAI");

  for (token of tokenList) {
    let price;
    if (token.symbol == "WETH") {
      price = weth_price;
    } else {
      price = dai_price;
    }
    console.log(
      await erc20TokenServiceInstance.updateERC20Token({
        id: token.id,
        market_price: price,
      })
    );
  }
});
