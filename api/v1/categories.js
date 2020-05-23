const express = require('express')
const router = express.Router();
const { check, validationResult } = require('express-validator');
const CategoryService = require('../services/categoryService')
let categoryServiceInstance = new CategoryService();
const upload = require('../utils/upload')
const validate = require('../utils/validate')
const verifyToken = require('../middlewares/verifyToken')

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

router.post('/', upload.single('categoryImage'), async (req, res) => {

  try {

    let { name, address } = req.body

    if (!name || !address) {
      return res.status(400).json({ message: 'input validation failed' })
    }

    let categoryExists = await categoryServiceInstance.categoryExists(req.body)

    if (categoryExists) {
      return res.status(400).json({ message: 'category already exists' })
    }

    for (data of JSON.parse(address)) {

      if (!validate.isValid(data.address) || await categoryServiceInstance.categoryAddressExists({ address: data.address })) {
        return res.status(400).json({ message: 'category address already exists' })
      }
    }

    let category = await categoryServiceInstance.createCategory(req.body, req.file.path);
    if (category) {
      return res.status(200).json({ message: 'category addedd successfully', data: category })
    } else {
      return res.status(400).json({ message: 'category addition failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})


/**
 *  Gets all the category details 
 */

router.get('/', verifyToken, async (req, res) => {
  try {

    let categories = await categoryServiceInstance.getCategories();
    if (categories) {
      return res.status(200).json({ message: 'categories retrieved successfully', data: categories })
    } else {
      return res.status(400).json({ message: 'categories retrieved failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})


/**
 *  Gets single category detail 
 *  @param id type: integer
 */

router.get('/:categoryId', [
  check('categoryId', 'A valid id is required').exists()
], verifyToken, async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let category = await categoryServiceInstance.getCategory(req.params);
    if (category) {
      return res.status(200).json({ message: 'Category retrieved successfully', data: category })
    } else {
      return res.status(400).json({ message: 'Category doesnt exist' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})

/**
 *  Gets tokens that belong to a category 
 *  @param id type: integer
 */

router.get('/:categoryId/tokens', [
  check('categoryId', 'A valid id is required').exists()
], verifyToken, async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let category = await categoryServiceInstance.getCategory(req.params)

    if (!category) {
      return res.status(400).json({ message: 'Category doesnt exist' })
    }

    let tokens = await categoryServiceInstance.getTokensFromCategory(req.params);

    if (tokens.length > 0) {
      return res.status(200).json({ message: 'Tokens retrieved successfully', data: tokens })
    } else {
      return res.status(400).json({ message: 'No tokens belong to this category' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})


module.exports = router;