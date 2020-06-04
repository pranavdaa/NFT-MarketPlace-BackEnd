const express = require('express')
const router = express.Router({ mergeParams: true })
const { check, validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");
const auth = require('../utils/auth')
const verifyToken = require('../middlewares/verifyToken')
const UserService = require('../services/userService')
let userServiceInstance = new UserService();
const TokenService = require('../services/tokenService')
let tokenServiceInstance = new TokenService();
const upload = require('../utils/upload')
import * as requestUtil from '../utils/request-utils'
import config from '../../config/config'


/**
 * User routes
 */

/**
 *  Adds the address of a new user
 *  @params address String
 *  @params signature String
 */

router.post('/', [
  check('address', 'A valid address is required').exists().isEthereumAddress(),
  check('signature', 'A valid signature is required').exists().isLength({ min: 132, max: 132 })
],
  async (req, res) => {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      let userExists = await userServiceInstance.userExists(req.body)
      if (userExists) {
        if (auth.isValidSignature({ owner: userExists.address, signature: req.body.signature })) {
          var token = jwt.sign({ userId: userExists.id }, config.secret, {
            expiresIn: "24h"
          });
          return res.status(200).json({ message: 'User authorized successfully', data: userExists, auth_token: token })
        } else {
          return res.status(401).json({ message: 'User authorization failed' })
        }
      } else {

        let user = await userServiceInstance.createUser(req.body);
        if (user) {

          if (auth.isValidSignature({ owner: user.address, signature: req.body.signature })) {
            var token = jwt.sign({ userId: user.id }, config.secret, {
              expiresIn: "24h"
            });
            return res.status(200).json({ message: 'User added and authorized successfully', data: user, auth_token: token })
          } else {
            return res.status(401).json({ message: 'User authorization failed' })
          }
        } else {
          return res.status(400).json({ message: 'User creation failed' })
        }
      }

    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'Internal Server error. Please try again!' })
    }
  })


/**
 *  Gets all the user details 
 */

router.get('/all', async (req, res) => {
  try {
    let limit = requestUtil.getLimit(req.query)
    let offset = requestUtil.getOffset(req.query)

    let orderBy = requestUtil.getSortBy(req.query, '+id')

    let data = await userServiceInstance.getUsers({ limit, offset, orderBy });

    if (data.users.length > 0) {
      return res.status(200).json({ message: 'Users retrieved successfully', data: data })
    } else {
      return res.status(404).json({ message: 'No user found' })
    }

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error. Please try again!' })
  }
})


/**
 *  Gets single user detail 
 */

router.get('/', verifyToken, async (req, res) => {
  try {

    let userId = req.userId;

    let users = await userServiceInstance.getUser({ userId });
    if (users) {
      return res.status(200).json({ message: 'Users retrieved successfully', data: users })
    } else {
      return res.status(404).json({ message: 'User not found' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error. Please try again!' })
  }
})


/**
 *  Gets users tokens
 */

router.get('/tokens', verifyToken, async (req, res) => {
  try {

    let userId = req.userId;

    let tokens = await userServiceInstance.getUsersTokens({ userId });
    if (tokens.length > 0) {
      return res.status(200).json({ message: 'User\'s tokens retrieved successfully', data: tokens })
    } else {
      return res.status(404).json({ message: 'User\'s tokens not found' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error. Please try again!' })
  }
})

/**
 *  Gets users token sell orders(maker order)
 */

router.get('/makerorders', verifyToken, async (req, res) => {
  try {

    let userId = req.userId;

    let orders = await userServiceInstance.getUsersMakerOrders({ userId });
    if (orders.length > 0) {
      return res.status(200).json({ message: 'User\'s orders retrieved successfully', data: orders })
    } else {
      return res.status(404).json({ message: 'User\'s orders not found' })
    }

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error. Please try again!' })
  }
})

/**
 *  Gets users token buy orders(taker order)
 */

router.get('/takerorders', verifyToken, async (req, res) => {
  try {

    let userId = req.userId;

    let orders = await userServiceInstance.getUsersTakerOrders({ userId });
    if (orders.length > 0) {
      return res.status(200).json({ message: 'User\'s orders retrieved successfully', data: orders })
    } else {
      return res.status(404).json({ message: 'User\'s orders not found' })
    }

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error. Please try again!' })
  }
})

/**
 *  Gets users bids on orders
 */

router.get('/bids', verifyToken, async (req, res) => {
  try {

    let userId = req.userId;

    let bids = await userServiceInstance.getUsersBids({ userId });
    if (bids.length > 0) {
      return res.status(200).json({ message: 'User\'s bids retrieved successfully', data: bids })
    } else {
      return res.status(404).json({ message: 'User\'s bids not found' })
    }

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error. Please try again!' })
  }
})

/**
 *  Gets users favorites tokens
 */
router.get('/favorites', verifyToken, async (req, res) => {
  try {

    let userId = req.userId;

    let favorites = await userServiceInstance.getUsersFavorite({ userId });
    if (favorites.length > 0) {
      return res.status(200).json({ message: 'User\'s favorites retrieved successfully', data: favorites })
    } else {
      return res.status(404).json({ message: 'Favorite tokens not found' })
    }

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error. Please try again!' })
  }
})

/**
 *  Adds tokens to users favorites list
 *  @params tokenId type: Integer 
 */

router.post('/favorites', [
  check('tokenId', 'A valid token id is required').exists()
], verifyToken, async (req, res) => {

  try {

    let userId = req.userId;

    let { tokenId } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let token = await tokenServiceInstance.getToken({ tokenId });
    if (!token) {
      return res.status(400).json({ message: 'Token not found' })
    }

    let favorites = await userServiceInstance.createUsersFavorite({ userId, tokenId });
    if (favorites.length > 0) {
      return res.status(200).json({ message: 'User\'s favorites added successfully', data: favorites })
    } else {
      return res.status(404).json({ message: 'User\'s favorites addition failed' })
    }

  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error. Please try again!' })
  }
})

module.exports = router;
