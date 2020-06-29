const { Client } = require("pg");
const config = require("../../config/config");

const connectionString = config.hermoine;

const client = new Client({
  connectionString: connectionString,
});

class TokenService {
  async getTokens(params) {
    try {
      client.connect();
      const query = {
        name: "fetch-tokens",
        text: "SELECT * FROM records WHERE owner = $1",
        values: [params.owner],
      };
      let tokens = await client.query(query);
      client.end();
      return tokens;
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }

  async getTokenDetail(params) {
    try {
      client.connect();
      const query = {
        name: "fetch-tokens",
        text: "SELECT * FROM records WHERE token_id = $1 AND contract = $2",
        values: [params.token_id, params.contract],
      };
      let tokens = await client.query(query);
      client.end();
      return tokens;
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }
}

module.exports = TokenService;
