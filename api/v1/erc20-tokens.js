const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const erc20TokenService = require("../services/erc20-token");
let erc20TokenServiceInstance = new erc20TokenService();
const validate = require("../utils/helper");
const verifyAdmin = require("../middlewares/verify-admin");
let requestUtil = require("../utils/request-utils");
let helper = require("../utils/helper");
let constants = require("../../config/constants");

/**
 * erc20token routes
 */

/**
 *  Adds a new erc20token
 *  @params name type: String
 *  @params symbol type: String
 *  @params decimal type: String
 *  @params addresses type: Object
 */

router.post(
  "/",
  [
    check("name", "A valid name is required").exists(),
    check("symbol", "A valid sumbol is required").exists(),
    check("decimal", "A valid decimal required").exists(),
    check("address", "A valid address is required").exists(),
  ],
  verifyAdmin,
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ error: errors.array() });
      }

      let { name, symbol, decimal, address } = req.body;

      if (!name || !address || !decimal || !symbol) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let erc20TokenExists = await erc20TokenServiceInstance.erc20TokenExists(
        req.body
      );

      if (erc20TokenExists) {
        return res.status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST).json({
          message: constants.MESSAGES.INPUT_VALIDATION_ERROR,
          data: erc20TokenExists,
        });
      }

      for (data of JSON.parse(address)) {
        if (
          !validate.isValidEthereumAddress(data.address) ||
          (await erc20TokenServiceInstance.erc20TokenAddressExists({
            address: data.address,
          }))
        ) {
          return res
            .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
            .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
        }
      }

      let erc20Token = await erc20TokenServiceInstance.addERC20Token(req.body);
      if (erc20Token) {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: erc20Token,
        });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.RESPONSE_STATUS.FAILURE });
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
 *  Gets erc20token usd price
 *  @param symbol type: integer
 */

router.get(
  "/price",
  [check("symbol", "A valid symbol is required").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ error: errors.array() });
      }

      let { symbol } = req.query;

      let price = await helper.getRate(symbol);

      if (price) {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: price,
        });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.RESPONSE_STATUS.FAILURE });
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
 *  Gets all the erc20token details
 */

router.get("/", async (req, res) => {
  try {
    let limit = requestUtil.getLimit(req.query);
    let offset = requestUtil.getOffset(req.query);
    let orderBy = requestUtil.getSortBy(req.query, "+id");

    let erc20Tokens = await erc20TokenServiceInstance.getERC20Tokens({
      limit,
      offset,
      orderBy,
    });
    if (erc20Tokens) {
      return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
        message: constants.RESPONSE_STATUS.SUCCESS,
        data: erc20Tokens,
      });
    } else {
      return res
        .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
        .json({ message: constants.RESPONSE_STATUS.FAILURE });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
  }
});

/**
 *  Gets single erc20token detail
 *  @param id type: integer
 */

router.get(
  "/:id",
  [check("id", "A valid id is required").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ error: errors.array() });
      }

      let erc20Token = await erc20TokenServiceInstance.getERC20Token(
        req.params
      );
      if (erc20Token) {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: erc20Token,
        });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.RESPONSE_STATUS.FAILURE });
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
 *  Updates an existing ERC20 token
 *  @params id type: Integer
 *  @params name type: String
 *  @params decimals type: String
 *  @params address type: Array of Objects
 */

router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    let params = { ...req.params, ...req.body };

    if (!params.id) {
      return res
        .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
        .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
    }

    let tokenExists = await erc20TokenServiceInstance.getERC20Token(params);

    if (!tokenExists) {
      return res
        .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
        .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
    }

    if (params.address) {
      for (data of JSON.parse(params.address)) {
        if (!validate.isValidEthereumAddress(data.address)) {
          return res
            .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
            .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
        }
      }
    }

    let token = await erc20TokenServiceInstance.updateERC20Token(params);
    if (token) {
      return res
        .status(constants.RESPONSE_STATUS_CODES.OK)
        .json({ message: constants.RESPONSE_STATUS.SUCCESS, data: token });
    } else {
      return res
        .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
        .json({ message: constants.RESPONSE_STATUS.FAILURE });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
  }
});

module.exports = router;
