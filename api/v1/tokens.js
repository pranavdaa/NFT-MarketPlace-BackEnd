const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const TokenService = require("../services/tokens");
const tokenServiceInstance = new TokenService();
const userService = require("../services/user");
let userServiceInstance = new userService();
const categoryService = require("../services/category");
let categoryServiceInstance = new categoryService();
const orderService = require("../services/order");
let orderServiceInstance = new orderService();
let redisCache = require("../utils/redis-cache");
let helper = require("../utils/helper");
let constants = require("../../config/constants");

/**
 * Token routes
 */

/**
 *  Gets all the token details on matic
 */

router.get(
  "/balance",
  [check("userId", "input a valid id").exists()],
  [check("chainId", "input a valid id").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ error: errors.array() });
      }

      let { userId, chainId } = req.query;

      let user = await userServiceInstance.getUser({ userId });

      if (!user) {
        return res.status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST).json({
          message: constants.MESSAGES.INPUT_VALIDATION_ERROR,
        });
      }

      let tokens = await tokenServiceInstance.getTokens({
        chainId,
        owner: user.address.toLowerCase(),
      });

      let tokensOwned = [];

      if (tokens.length > 0) {
        for (token of tokens) {
          let metadata = await redisCache.getTokenData(
            token.token_id,
            token.contract,
            chainId
          );
          let active = {
            active_order: await orderServiceInstance.checkValidOrder({
              userId,
              tokenId: token.token_id,
            }),
          };

          token.token_id = token.token_id;

          tokensOwned.push({ ...token, ...metadata, ...active });
        }

        let tokensOwnedPerCategory = {};
        for (tokenDetail of tokensOwned) {
          let singleCategory = (
            await categoryServiceInstance.getCategoryByAddress({
              categoryAddress: tokenDetail.contract,
            })
          ).filter((res) => {
            return res.chain_id === chainId;
          });

          if (tokensOwnedPerCategory[singleCategory[0].address]) {
            tokensOwnedPerCategory[singleCategory[0].address]++;
          } else {
            tokensOwnedPerCategory[singleCategory[0].address] = 1;
          }
        }

        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: tokensOwned,
          balances: tokensOwnedPerCategory,
          count: tokensOwned.length,
        });
      } else {
        return res.status(constants.RESPONSE_STATUS_CODES.NOT_FOUND).json({
          message: constants.RESPONSE_STATUS.NOT_FOUND,
        });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
);

module.exports = router;
