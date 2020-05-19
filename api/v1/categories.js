const express = require('express')
const router = express.Router();
const { query, body, validationResult } = require('express-validator');
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
 *  @params address
 */

router.post('/', [
    body('name', 'A valid name is required').exists(),
    body('decription', 'A valid name is required').exists(),
    body('url', 'A valid name is required').exists(),
    body('matic_address', 'A valid name is required').exists(),
    body('ethereum_address', 'A valid name is required').exists(),
], upload.single('categoryImage'), async (req, res, next) => {

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
 *  Gets all the category details 
 */

router.get('/:id', async (req, res, next) => {
    try {

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


module.exports = router;