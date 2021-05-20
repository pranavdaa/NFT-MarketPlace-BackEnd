let path = require("path");
let dotenv = require("dotenv");

// load config env
let root = path.normalize(`${__dirname}/..`);
let fileName = "";

switch (process.env.NODE_ENV) {
  case "production": {
    fileName = "/config-production.env";
    break;
  }
  case "test": {
    fileName = "/config-test.env";
    break;
  }
  default:
    fileName = "/.env";
}

const configFile = `${root}${fileName}`;
dotenv.config({ path: configFile, silent: true });

module.exports = {
  secret: process.env.jwt_secret,
  port: process.env.PORT,
  admin_username: process.env.admin_username,
  admin_password: process.env.admin_password,
  NODE_ENV: process.env.NODE_ENV,
  admin_private_key: process.env.private_key,
  MNEMONIC: process.env.MNEMONIC,
  MATIC_CHAIN_ID: process.env.MATIC_CHAIN_ID,
  ETHEREUM_CHAIN_ID: process.env.ETHEREUM_CHAIN_ID,
  MATIC_RPC: process.env.MATIC_RPC,
  ETHEREUM_RPC: process.env.ETHEREUM_RPC,
  FROM_ADDRESS: process.env.FROM_ADDRESS,
  DONATION_AMOUNT: process.env.DONATION_AMOUNT,
  MINIMUM_BALANCE: process.env.MINIMUM_BALANCE,
  BALANCE_URL: process.env.BALANCE_URL,
  TOKEN_DETAILS_URL: process.env.TOKEN_DETAILS_URL,
  WETH_ADDRESS: process.env.WETH_ADDRESS
};
