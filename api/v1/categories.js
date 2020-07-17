const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const categoryService = require("../services/category");
let categoryServiceInstance = new categoryService();
const upload = require("../utils/upload");
const validate = require("../utils/helper");
const verifyAdmin = require("../middlewares/verify-admin");
let requestUtil = require("../utils/request-utils");

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
        return res.status(400).json({ message: "input validation failed" });
      }

      let categoryExists = await categoryServiceInstance.categoryExists(
        req.body
      );

      if (categoryExists) {
        return res.status(400).json({ message: "category already exists" });
      }

      for (let data of JSON.parse(address)) {
        if (
          !validate.isValidEthereumAddress(data.address) ||
          (await categoryServiceInstance.categoryAddressExists({
            address: data.address,
          }))
        ) {
          return res
            .status(400)
            .json({ message: "category address already exists" });
        }
      }

      let category = await categoryServiceInstance.createCategory(
        req.body,
        req.file
      );
      if (category) {
        return res
          .status(200)
          .json({ message: "category addedd successfully", data: category });
      } else {
        return res.status(400).json({ message: "category addition failed" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal Server error.Please try again" });
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
      return res.status(200).json({
        message: "categories retrieved successfully",
        data: categories,
      });
    } else {
      return res.status(400).json({ message: "categories retrieved failed" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal Server error.Please try again" });
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
        return res.status(400).json({ error: errors.array() });
      }

      let category = await categoryServiceInstance.getCategory(req.params);
      if (category) {
        return res
          .status(200)
          .json({ message: "Category retrieved successfully", data: category });
      } else {
        return res.status(400).json({ message: "Category doesnt exist" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal Server error.Please try again" });
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
        return res.status(400).json({ message: "Input validation failed" });
      }

      let categoryExists = await categoryServiceInstance.getCategory(params);

      if (!categoryExists) {
        return res.status(400).json({ message: "Category doesnt exists" });
      }

      if (params.address) {
        for (data of JSON.parse(params.address)) {
          if (
            !validate.isValidEthereumAddress(data.address) ||
            (await categoryServiceInstance.categoryAddressExists({
              address: data.address,
            }))
          ) {
            return res
              .status(400)
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
          .status(200)
          .json({ message: "category addedd successfully", data: category });
      } else {
        return res.status(400).json({ message: "category addition failed" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal Server error.Please try again" });
    }
  }
);

module.exports = router;
