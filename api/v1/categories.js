const express = require('express')
const router = express.Router();
const { query, check, validationResult } = require('express-validator');
const CategoryService = require('../services/categoryService')
let categoryServiceInstance = new CategoryService();
const multer = require('multer');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/');
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toISOString() + file.originalname);
  }
});

const upload = multer({
  storage: storage,
});

/**
 * Category routes
 */

/**
 *  Adds a new category of NFT token
 *  @params name type: String
 *  @params description type: String
 *  @params url type: String
 *  @params addresses type: Object
 *  @param categoryImage type: file 
 */

router.post('/', upload.single('categoryImage'), async (req, res, next) => {

  try {

    let categoryExists = await categoryServiceInstance.categoryExists(req.body)

    if (categoryExists) {
      return res.status(200).json({ message: 'category already exists', data: categoryExists })
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

router.get('/', async (req, res, next) => {
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

router.get('/:id', [check('id', 'A valid id is required').exists()
], async (req, res, next) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let category = await categoryServiceInstance.getCategory(req.params);
    if (category) {
      return res.status(200).json({ message: 'Category retrieved successfully', data: category })
    } else {
      return res.status(400).json({ message: 'Category retrieved failed' })
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

router.get('/:id/tokens', [
  check('id', 'A valid id is required').exists()
], async (req, res, next) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let token = await categoryServiceInstance.getTokensFromCategory(req.params);
    if (token) {
      return res.status(200).json({ message: 'Tokens retrieved successfully', data: token })
    } else {
      return res.status(400).json({ message: 'Tokens retrieved failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})


module.exports = router;