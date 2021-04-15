const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const TokenService = require("../services/tokens");
const tokenServiceInstance = new TokenService();
const userService = require("../services/user");
let userServiceInstance = new userService();
const categoryService = require("../services/category");
let categoryServiceInstance = new categoryService();
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
        userId,
      });

      if (tokens.nft_array.length > 0) {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: tokens.nft_array,
          balances: tokens.balances,
          count: tokens.nft_array.length,
        });
      } else {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
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

/**
 *  Adds a new token or updates existing token
 *  @params token_id type: String
 *  @params category_id type: Int
 *  @params description type: String
 *  @params image_url type: String
 *  @params external_url type: String
 *  @params name type: String
 *  @params attributes type: String
 */

router.post(
  "/",
  check("token_id", "A valid id is required").exists(),
  check("category_id", "A valid id is required").exists(),
  async (req, res) => {
    try {

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ error: errors.array() });
      }

      let category = await categoryServiceInstance.getCategory({
        categoryId: category_id,
      });

      if (!category) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let tokenDetail = await tokenServiceInstance.getToken(req.body);

      if (!tokenDetail) {
        let token = await tokenServiceInstance.createToken(req.body);
        if (token) {
          return res
            .status(constants.RESPONSE_STATUS_CODES.OK)
            .json({ message: constants.RESPONSE_STATUS.SUCCESS, data: token });
        } else {
          return res
            .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
            .json({ message: constants.RESPONSE_STATUS.FAILURE });
        }
      } else {
        let token = await tokenServiceInstance.updateToken(req.body);
        if (token) {
          return res
            .status(constants.RESPONSE_STATUS_CODES.OK)
            .json({ message: constants.RESPONSE_STATUS.SUCCESS, data: token });
        } else {
          return res
            .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
            .json({ message: constants.RESPONSE_STATUS.FAILURE });
        }
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
