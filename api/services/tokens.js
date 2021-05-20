const { Client } = require("pg");
let constants = require("../../config/constants");
const helper = require("../utils/helper");
const prisma = require("../../prisma");
const orderService = require("../services/order");
let orderServiceInstance = new orderService();
const categoryService = require("../services/category");
let categoryServiceInstance = new categoryService();

class TokenService {
  /**
   * takes chain id and user address as parameter and fetches balances of each token address
   * @param {params} params object of chainid, user address
   */
  async getTokens(params) {
    try {
      let balance_list = {};
      let { owner, userId, chainId } = params;
      if (params.chainId === constants.MATIC_CHAIN_ID) {
        const tokenIdArray = await helper.matic_balance(
          owner,
          userId
        );

        let nft_array = [];
        let balances = {};

        for (const data in tokenIdArray) {
          let categoryDetail = await categoryServiceInstance.getCategoryByAddress(
            {
              categoryAddress: helper.toChecksumAddress(data),
              chainId: chainId,
            }
          );

          if (categoryDetail) {
            let category = await categoryServiceInstance.getCategory({
              categoryId: categoryDetail.categories_id,
            });

            let token_array = [];
            for (const nft of tokenIdArray[data].tokens) {
              let token = await this.getToken({
                token_id: nft.id,
                category_id: category.id,
              });

              let metadata = JSON.parse(nft.metadata);

              if (!metadata) {
                if (category.tokenURI) {
                  metadata = await helper.fetchMetadataFromTokenURI(
                    category.tokenURI + nft.id
                  );
                } else {
                  if (nft.token_uri) {
                    metadata = await helper.fetchMetadataFromTokenURI(
                      nft.token_uri
                    );
                  }
                }
              }

              if (!token) {
                token = await this.createToken({
                  token_id: nft.id,
                  category_id: category.id,
                  name: metadata ? metadata.name : "",
                  description: metadata ? metadata.description : "",
                  image_url: metadata ? metadata.image : "",
                  external_url: metadata ? metadata.external_url : "",
                  attributes: metadata
                    ? JSON.stringify(metadata.attributes)
                    : "",
                });
              } else {
                token = await this.updateToken({
                  token_id: nft.id,
                  category_id: category.id,
                  name: metadata ? metadata.name : "",
                  description: metadata ? metadata.description : "",
                  image_url: metadata ? metadata.image : "",
                  external_url: metadata ? metadata.external_url : "",
                  attributes: metadata
                    ? JSON.stringify(metadata.attributes)
                    : "",
                });
              }

              let orderDetail = await orderServiceInstance.checkValidOrder({
                userId: userId,
                tokenId: nft.id,
                categoryId: category.id,
              });

              token_array.push({
                contract: helper.toChecksumAddress(tokenIdArray[data].contract),
                token_id: token.token_id,
                owner: params.owner,
                name: token.name,
                description: token.description,
                attributes: token.attributes,
                image_url: token.image_url,
                external_link: token.external_url,
                amount: nft.amount,
                type: category.type,
                ...orderDetail,
              });
            }

            if (token_array) {
              nft_array.push(...token_array);
              balances[helper.toChecksumAddress(tokenIdArray[data].contract)] =
                token_array.length;
            }
          }
        }
        balance_list = { nft_array, balances };
      }
      if (params.chainId === constants.ETHEREUM_CHAIN_ID) {
        balance_list = { nft_array: [], balances: {} };
      }

      return balance_list;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async createToken(params) {
    try {
      let { token_id, description, image_url, external_url, attributes, name, category_id } = params;
      let token = await prisma.tokens.create({
        data: {
          token_id: token_id,
          description: description,
          image_url: image_url,
          external_url: external_url,
          attributes: attributes,
          name: name,
          name_lowercase: (name).toLowerCase(),
          categories: { connect: { id: parseInt(category_id) } },
        },
      });
      return token;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getToken(params) {
    try {
      let { token_id, category_id } = params;
      let token = await prisma.tokens.findOne({
        where: {
          token_id_categories_id: {
            token_id: token_id,
            categories_id: category_id,
          },
        },
      });
      return token;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateToken(params) {
    // console.log(params)
    try {
      let current = await this.getToken(params);
      let { description: params_description, external_url: params_external_url, attributes: params_attributes, name: params_name, image_url: params_image_url, name_lowercase: params_name_lowercase } = params;
      let { description: current_description, external_url: current_external_url, attributes: current_attributes, token_id: current_token_id, categories_id: current_categories_id, image_url: current_image_url, name_lowercase: current_name_lowercase } = current;
      let token = await prisma.tokens.update({
        where: {
          token_id_categories_id: {
            token_id: current_token_id,
            categories_id: current_categories_id,
          },
        },
        data: {
          description: params_description
            ? params_description
            : current_description,
          image_url: params_image_url ? params_image_url : current_image_url,
          external_url: params.external_url
            ? params_external_url
            : current_external_url,
          attributes: params.attributes
            ? params.attributes
            : current.attributes,
          name: params_name && params_name !== "" ? params_name : current_name,
          name_lowercase:
            params.name_lowercase && params.name_lowercase !== ""
              ? params_name_lowercase
              : current_name_lowercase,
        },
      });

      return token;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = TokenService;
