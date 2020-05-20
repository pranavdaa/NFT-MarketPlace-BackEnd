const express = require('express')
const router = express.Router();
const { query, check, validationResult } = require('express-validator');
const TokenService = require('../services/tokenService')
let tokenServiceInstance = new TokenService();
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
 *  Adds a new token for a particular category
 *  @params name type: name
 *  @params description type: description
 *  @params category type: integer
 *  @params metadata type: string
 *  @params owner type: integer
 *  @params token_id type: string
 *  @param tokenImage type: image-file 
 */

router.post('/', upload.single('tokenImage'), async (req, res, next) => {

  try {


    if (!req.body.category || !req.body.owner || !req.body.token_id) {
      return res.status(400).json({ message: 'input validation failed' })
    }

    let tokenExists = await tokenServiceInstance.tokenExists(req.body)

    if (tokenExists.length > 0) {
      return res.status(200).json({ message: 'Token already exists', data: tokenExists })
    }

    let token = await tokenServiceInstance.createToken(req.body, req.file.path);
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

router.get('/', async (req, res, next) => {
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

router.get('/:id', [
  check('id', 'A valid id is required').exists()
], async (req, res, next) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let token = await tokenServiceInstance.getToken(req.params);
    if (token) {
      return res.status(200).json({ message: 'Token retrieved successfully', data: token })
    } else {
      return res.status(400).json({ message: 'Token retrieved failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})

module.exports = router;