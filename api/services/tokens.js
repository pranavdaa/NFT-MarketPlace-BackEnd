const { Client } = require("pg");
const config = require("../../config/config");
let constants = require("../../config/constants");

const connectionString = config.hermoine;

const client = new Client({
  connectionString: connectionString,
});
client.connect();

class TokenService {
  async getTokens(params) {
    try {
      const query = {
        name: "fetch-tokens",
        text: "SELECT * FROM records WHERE owner = $1",
        values: [params.owner],
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
