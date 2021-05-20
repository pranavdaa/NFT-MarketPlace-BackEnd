const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const categoryService = require("../services/category");
let categoryServiceInstance = new categoryService();
const upload = require("../utils/upload");
const validate = require("../utils/helper");
const verifyAdmin = require("../middlewares/verify-admin");
let requestUtil = require("../utils/request-utils");
let constants = require("../../config/constants");

/**
 * Category routes
 */

/**
 *  Adds a new category of NFT token
 *  @params name type: String
 *  @params description type: String
 *  @params url type: String
 *  @params address type: Array of Objects
 *  @param categoryImage type: file
 */

router.post(
  "/",
  verifyAdmin,
  upload.single("categoryImage"),
  async (req, res) => {
    try {
      let { name, address } = req.body;

      if (!name || !address) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let categoryExists = await categoryServiceInstance.categoryExists(
        req.body
      );

      if (categoryExists) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      for (let data of JSON.parse(address)) {
        if (
          !validate.isValidEthereumAddress(data.address) ||
          (await categoryServiceInstance.categoryAddressExists({
            address: data.address,
            chain_id: data.chain_id,
          }))
        ) {
          return res
            .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
            .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
        }
      }

      let category = await categoryServiceInstance.createCategory(
        req.body,
        req.file
      );
      if (category) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.OK)
          .json({ message: constants.RESPONSE_STATUS.SUCCESS, data: category });
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
 *  Gets all the category details
 */

router.get("/", async (req, res) => {
  try {
    let limit = requestUtil.getLimit(req.query);
    let offset = requestUtil.getOffset(req.query);
    let orderBy = requestUtil.getSortBy(req.query, "+id");

    let categories = await categoryServiceInstance.getCategories({
      limit,
      offset,
      orderBy,
    });
    if (categories) {
      /**
       * re-form categories array to include count of orders in each object
       */
      let categoriesArray = categories.categories;

      categoriesArray.map((categoryDetail) => {
        return (categoryDetail.orders = categoryDetail.orders.length);
      });

      categoriesArray.sort((a, b) => {
        return b.orders - a.orders;
      });

      return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
        message: constants.RESPONSE_STATUS.SUCCESS,
        data: {
          categories: categoriesArray,
        },
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
 *  Gets single category detail
 *  @param id type: integer
 */

router.get(
  "/:categoryId",
  [check("categoryId", "A valid id is required").exists()],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ error: errors.array() });
      }

      let category = await categoryServiceInstance.getCategory(req.params);
      if (category) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.OK)
          .json({ message: constants.RESPONSE_STATUS.SUCCESS, data: category });
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
 *  Updates an existing category of NFT token
 *  @params categoryId type: Integer
 *  @params description type: String
 *  @params url type: String
 *  @params address type: Array of Objects
 *  @params categoryImage type: File
 */

router.put(
  "/:categoryId",
  verifyAdmin,
  upload.single("categoryImage"),
  async (req, res) => {
    try {
      let params = { ...req.params, ...req.body };

      if (!params.categoryId) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let categoryExists = await categoryServiceInstance.getCategory(params);

      if (!categoryExists) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: "Category doesnt exists" });
      }

      if (params.address) {
        for (data of JSON.parse(params.address)) {
          if (
            !validate.isValidEthereumAddress(data.address) ||
            (await categoryServiceInstance.categoryAddressExists({
              address: data.address,
              chain_id: data.chain_id,
            }))
          ) {
            return res
              .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
              .json({ message: "category address already exists" });
          }
        }
      }

      let category = await categoryServiceInstance.updateCategory(
        params,
        req.file
      );
      if (category) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.OK)
          .json({ message: "category addedd successfully", data: category });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: "category addition failed" });
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
