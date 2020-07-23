const { Client } = require("pg");
const config = require("../../config/config");
let constants = require("../../config/constants");
const categoryService = require("../services/category");
let categoryServiceInstance = new categoryService();

const connectionString = config.hermoine;

const client = new Client({
  connectionString: connectionString,
});
client.connect();

class TokenService {
  async getTokens(params) {
    try {
      let categories = await categoryServiceInstance.getCategoryList({
        chainId: constants.MATIC_CHAIN_ID,
      });

      let nft_array = [];

      for (let data of categories) {
        nft_array.push(data.address);
      }

      nft_array.push("0x4dEcX06A6f31d71Ac14fa9d77CdE23800619fE24");

      var param_array = [];
      for (var i = 2; i <= nft_array.length + 1; i++) {
        param_array.push("$" + i);
      }

      let value_array = [params.owner];
      value_array = [...value_array, ...nft_array];

      const query = {
        name: "fetch-tokens",
        text:
          "SELECT * FROM records WHERE owner = $1 AND contract IN (" +
          param_array.join(",") +
          ")",
        values: value_array,
      };
      let tokens = await client.query(query);

      return tokens.rows;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTokenDetail(params) {
    try {
      const query = {
        name: "fetch-token-detail",
        text: "SELECT * FROM records WHERE token_id = $1 AND contract = $2",
        values: [params.tokenId, params.contract],
      };
      let tokens = await client.query(query);
      return tokens.rows;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = TokenService;
