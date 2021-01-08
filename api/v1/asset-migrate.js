const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const assetMigrateService = require("../services/asset-migrate");
let assetMigrateServiceInstance = new assetMigrateService();
const categoryService = require("../services/category");
let categoryServiceInstance = new categoryService();
const validate = require("../utils/helper");
const verifyToken = require("../middlewares/verify-token");
let requestUtil = require("../utils/request-utils");
let constants = require("../../config/constants");

/**
 * Token migration routes
 */

/**
 *  Adds a new deposit info
 *  @params category_id type: Integer
 *  @params txHash type: String
 *  @params token_array type: String Array
 *  @params type type: String
 */

router.post(
  "/",
  [
    check("category_id", "A valid id is required").exists(),
    check("txhash", "A valid transaction hash is required").exists(),
    check("token_array", "A valid token list is required").exists(),
    check("type", "A valid type is required")
      .exists()
      .isIn([
        constants.ASSET_TRANSFER.WITHDRAW,
        constants.ASSET_TRANSFER.DEPOSIT,
      ]),
  ],
  verifyToken,
  async (req, res) => {
    try {
      let { category_id } = req.body;
      let userId = req.userId;

      let categoryExists = await categoryServiceInstance.getCategory({
        categoryId: category_id,
      });

      if (!categoryExists) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let assetMigrate = await assetMigrateServiceInstance.createAssetMigrate({
        ...req.body,
        ...{ userId: userId },
      });
      if (assetMigrate) {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: assetMigrate,
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
 *  Gets all the asset migration details
 */

router.get(
  "/",
  [
    check("user_id", "A valid id is required").exists(),
    check("type", "A valid type is required").exists(),
    check("status", "A valid status type is required").exists(),
  ],
  async (req, res) => {
    try {
      let limit = requestUtil.getLimit(req.query);
      let offset = requestUtil.getOffset(req.query);
      let orderBy = requestUtil.getSortBy(req.query, "+id");

      let { user_id, type, status } = req.query;

      let assetMigrations = await assetMigrateServiceInstance.getAssetMigrations(
        {
          limit,
          offset,
          orderBy,
          type,
          userId: user_id,
          status,
        }
      );
      if (assetMigrations) {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: assetMigrations,
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
 *  Gets assetMigration detail
 *  @param id type: integer
 */

router.get(
  "/:assetMigrationId",
  [check("assetMigrationId", "A valid id is required").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ error: errors.array() });
      }

      let assetMigration = await assetMigrateServiceInstance.getAssetMigration(
        req.params
      );
      if (assetMigration) {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: assetMigration,
        });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.NOT_FOUND)
          .json({ message: constants.RESPONSE_STATUS.NOT_FOUND });
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
 *  Updates an existing asset migration
 *  @params assetMigrationId type: Integer
 *  @params status type: Integer
 *  @params exit_txhash type: String
 */

router.put(
  "/:assetMigrationId",
  [check("assetMigrationId", "A valid id is required").exists()],
  [check("status", "A valid status is required").exists()],
  verifyToken,
  async (req, res) => {
    try {
      let params = { ...req.params, ...req.body };

      if (!params.assetMigrationId) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let assetMigrationExists = await assetMigrateServiceInstance.getAssetMigration(
        params
      );

      if (!assetMigrationExists) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let assetMigration = await assetMigrateServiceInstance.updateAssetMigration(
        params,
        req.file
      );
      if (assetMigration) {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: assetMigration,
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

module.exports = router;
