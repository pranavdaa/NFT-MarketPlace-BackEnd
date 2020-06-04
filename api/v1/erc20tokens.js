const express = require('express')
const router = express.Router();
const { check, validationResult } = require('express-validator');
const Erc20tokenService = require('../services/erc20tokenService')
let erc20tokenServiceInstance = new Erc20tokenService();
const validate = require('../utils/validate')
const verifyToken = require('../middlewares/verifyToken')

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

router.post('/', [
  check('name', 'A valid name is required').exists(),
  check('symbol', 'A valid sumbol is required').exists(),
  check('decimal', 'A valid decimal required').exists(),
  check('address', 'A valid address is required').exists(),
], async (req, res) => {

  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let { name, symbol, decimal, address } = req.body

    if (!name || !address || !decimal || !symbol) {
      return res.status(400).json({ message: 'input validation failed' })
    }

    let erc20tokenExists = await erc20tokenServiceInstance.erc20tokenExists(req.body)

    if (erc20tokenExists) {
      return res.status(200).json({ message: 'erc20token already exists', data: erc20tokenExists })
    }

    for (data of JSON.parse(address)) {

      if (!validate.isValidEthereumAddress(data.address) || await erc20tokenServiceInstance.erc20tokenAddressExists({ address: data.address })) {
        return res.status(400).json({ message: 'ERC20 token address already exists' })
      }
    }

    let erc20token = await erc20tokenServiceInstance.adderc20token(req.body);
    if (erc20token) {
      return res.status(200).json({ message: 'erc20token addedd successfully', data: erc20token })
    } else {
      return res.status(400).json({ message: 'erc20token addition failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})


/**
 *  Gets all the erc20token details 
 */

router.get('/', verifyToken, async (req, res) => {
  try {

    let erc20tokens = await erc20tokenServiceInstance.geterc20tokens();
    if (erc20tokens) {
      return res.status(200).json({ message: 'erc20tokens retrieved successfully', data: erc20tokens })
    } else {
      return res.status(400).json({ message: 'erc20tokens retrieved failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})



/**
 *  Gets single erc20token detail 
 *  @param id type: integer
 */

router.get('/:id', [check('id', 'A valid id is required').exists()
], verifyToken, async (req, res) => {
  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let erc20token = await erc20tokenServiceInstance.geterc20token(req.params);
    if (erc20token) {
      return res.status(200).json({ message: 'erc20token retrieved successfully', data: erc20token })
    } else {
      return res.status(400).json({ message: 'erc20token retrieved failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})


/**
 *  Updates an existing ERC20 token
 *  @params id type: Integer
 *  @params name type: String
 *  @params decimals type: String
 *  @params address type: Array of Objects
 */

router.put('/:id', async (req, res) => {

  try {


    let params = { ...req.params, ...req.body }

    if (!params.id) {
      return res.status(400).json({ message: 'Input validation failed' })
    }

    let tokenExists = await erc20tokenServiceInstance.geterc20token(params)

    if (!tokenExists) {
      return res.status(400).json({ message: 'Token doesnt exists' })
    }

    if (params.address) {
      for (data of JSON.parse(params.address)) {
        if (!validate.isValidEthereumAddress(data.address) || await erc20tokenServiceInstance.erc20tokenAddressExists({ address: data.address })) {
          return res.status(400).json({ message: 'Token address already exists' })
        }
      }
    }

    let token = await erc20tokenServiceInstance.updateerc20token(params);
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

module.exports = router;
