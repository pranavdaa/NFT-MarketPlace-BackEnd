const express = require('express')
const router = express.Router();
const { check, validationResult } = require('express-validator');
const TokenService = require('../services/tokenService')
let tokenServiceInstance = new TokenService();
const CategoryService = require('../services/categoryService')
let categoryServiceInstance = new CategoryService();
const upload = require('../utils/upload')
const verifyToken = require('../middlewares/verifyToken')

/**
 * Token routes
 */

/**
 *  Adds a new token for a particular category
 *  @params name type: name
 *  @params description type: description
 *  @params categoryId type: integer
 *  @params metadata type: string
 *  @params token_id type: string
 *  @param tokenImage type: image-file 
 */

router.post('/', verifyToken, upload.single('tokenImage'), async (req, res) => {

  try {

    let userId = req.userId;
    let { categoryId, token_id, name } = req.body

    if (!categoryId || !token_id || !name) {
      return res.status(400).json({ message: 'input validation failed' })
    }

    let category = await categoryServiceInstance.getCategory({ categoryId })

    if (!category) {
      return res.status(400).json({ message: 'Category doesnt exist' })
    }

    // Token validation correction needed. Does not consider composite key now.

    let tokens = await tokenServiceInstance.tokenExists(req.body)

    if (tokens.length > 0) {
      return res.status(400).json({ message: 'Token already exist' })
    }

    req.body.userId = userId;
    let token = await tokenServiceInstance.createToken(req.body, req.file);
    if (token) {
      return res.status(200).json({ message: 'Token addedd successfully', data: token })
    } else {
      return res.status(400).json({ message: 'Token addition failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})


/**
 *  Gets all the token details 
 */

router.get('/', verifyToken, async (req, res) => {
  try {

    let tokens = await tokenServiceInstance.getTokens();
    if (tokens) {
      return res.status(200).json({ message: 'Tokens retrieved successfully', data: tokens })
    } else {
      return res.status(400).json({ message: 'Tokens retrieved failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})



/**
 *  Gets single token detail 
 *  @param id type: integer
 */

router.get('/:tokenId', [
  check('tokenId', 'A valid id is required').exists()
], verifyToken, async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let token = await tokenServiceInstance.getToken(req.params);
    if (token) {
      return res.status(200).json({ message: 'Token retrieved successfully', data: token })
    } else {
      return res.status(400).json({ message: 'Token does not exist' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})

module.exports = router;