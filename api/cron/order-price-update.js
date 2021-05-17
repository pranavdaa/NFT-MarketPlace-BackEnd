const cron = require("node-cron");
const prisma = require("../../prisma");

cron.schedule("*/59 * * * * *", async function () {
  // updates order usd_prices by mulitplying prices and their corresponding crypto value from erc20tokens tables
  const result = await prisma.raw('update mainnet.orders O set usd_price = subquery.usd_price from (select cast(O.price AS FLOAT) * cast(E.market_price AS FLOAT) as usd_price, O.id as order_id from mainnet.orders O inner join mainnet.erc20tokens E ON O.erc20tokens_id =E.id) as subquery where O.id = subquery.order_id;');
  console.log('cron order_usd_prices : no. of rows updated = '+result);
});