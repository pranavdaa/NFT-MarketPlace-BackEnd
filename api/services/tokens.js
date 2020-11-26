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
      let categories = await categoryServiceInstance.getCategoryList({
        chainId: params.chainId,
      });

      let nft_array = [];
      let balances = {};

      for (let data of categories) {
        let balance_list;
        if (params.chainId === constants.MATIC_CHAIN_ID) {
          if (data.categoriesaddresses && data.categoriesaddresses.length > 0) {
            balance_list = await helper.matic_balance(
              params.owner,
              data.categoriesaddresses[0].address,
              data.categoriesaddresses[0].ethereum_address,
              params.userId,
              data.isOpenseaCompatible,
              data.tokenURI,
              data.description
            );
          }
        }
        if (params.chainId === constants.ETHEREUM_CHAIN_ID) {
          if (data.categoriesaddresses && data.categoriesaddresses.length > 0) {
            balance_list = await helper.ethereum_balance(
              params.owner,
              data.categoriesaddresses[0].address,
              data.categoriesaddresses[0].ethereum_address,
              params.userId,
              data.isOpenseaCompatible,
              data.tokenURI,
              data.description
            );
          }
        }

        if (balance_list) {
          nft_array.push(...balance_list);
          balances[data.address] = balance_list.length;
        }
      }

      return { nft_array, balances };
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = TokenService;
