const { Client } = require("pg");
const config = require("../../config/config");
let constants = require("../../config/constants");
const helper = require("../utils/helper");
const categoryService = require("../services/category");
let categoryServiceInstance = new categoryService();

class TokenService {
  /**
   * takes chain id and user address as parameter and fetches balances of each token address
   * @param {params} params object of chainid, user address
   */
  async getTokens(params) {
    try {
      let balance_list;
      if (params.chainId === constants.MATIC_CHAIN_ID) {
        balance_list = await helper.matic_balance(params.owner, params.userId);
      }
      if (params.chainId === constants.ETHEREUM_CHAIN_ID) {
        balance_list = await helper.ethereum_balance(
          params.owner,
          params.userId
        );
      }

      let { nft_array, balances } = balance_list;
      return { nft_array, balances };
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = TokenService;
