const { Client } = require("pg");
const config = require("../../config/config");
let constants = require("../../config/constants");
const categoryService = require("../services/category");
const helper = require("../utils/helper");
let categoryServiceInstance = new categoryService();

// const connectionString = config.hermoine;

// const client = new Client({
//   connectionString: connectionString,
// });
// client.connect();

class TokenService {
  /**
   * takes chain id and user address as parameter and fetches balances of each token address
   * @param {params} params object of chainid, user address
   */
  async getTokens(params) {
    try {
      let categories = await categoryServiceInstance.getCategoryList({
        chainId: params.chainId,
      });
  
      let nft_array = [];
  
      for (let data of categories) {
        let balance_list;
        if (params.chainId === "80001") {
          balance_list = await helper.matic_balance(params.owner, data.address);
        } else {
          balance_list = await helper.ethereum_balance(
            params.owner,
            data.address
          );
        }
        if (balance_list) {
          for (let token of balance_list) {
            nft_array.push(token);
          }
        }
      }
  
      return nft_array;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getTokenDetail(params) {
    try {
      let detail;
      if (params.chainId === "80001") {
        detail = await helper.matic_nft_detail(
          params.tokenId,
          params.contractAddress
        );
      } else {
        detail = await helper.ethereum_nft_detail(
          params.tokenId,
          params.contractAddress
        );
      }

      return detail;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  // Hermoine token balance fetch
  // async getTokens(params) {
  //   try {
  //     let categories = await categoryServiceInstance.getCategoryList({
  //       chainId: constants.MATIC_CHAIN_ID,
  //     });

  //     let nft_array = [];

  //     for (let data of categories) {
  //       nft_array.push(data.address);
  //     }

  //     nft_array.push("0x4dEcX06A6f31d71Ac14fa9d77CdE23800619fE24");

  //     var param_array = [];
  //     for (var i = 2; i <= nft_array.length + 1; i++) {
  //       param_array.push("$" + i);
  //     }

  //     let value_array = [params.owner];
  //     value_array = [...value_array, ...nft_array];

  //     const query = {
  //       name: "fetch-tokens",
  //       text:
  //         "SELECT * FROM records WHERE owner = $1 AND contract IN (" +
  //         param_array.join(",") +
  //         ")",
  //       values: value_array,
  //     };
  //     let tokens = await client.query(query);

  //     return tokens.rows;
  //   } catch (err) {
  //     console.log(err);
  //     throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
  //   }
  // }

  // async getTokenDetail(params) {
  //   try {
  //     const query = {
  //       name: "fetch-token-detail",
  //       text: "SELECT * FROM records WHERE token_id = $1 AND contract = $2",
  //       values: [params.tokenId, params.contract],
  //     };
  //     let tokens = await client.query(query);
  //     return tokens.rows;
  //   } catch (err) {
  //     console.log(err);
  //     throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
  //   }
  // }
}

module.exports = TokenService;
