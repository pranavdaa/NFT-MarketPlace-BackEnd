const express = require('express')
const router = express.Router({ mergeParams: true })
const { check, validationResult } = require('express-validator');
const jwt = require("jsonwebtoken");
const auth = require('../utils/auth')
const verifyToken = require('../middlewares/verifyToken')
const UserService = require('../services/userService')
let userServiceInstance = new UserService();

/**
 * User routes
 */

/**
 *  Adds the address of a new user
 *  @params address String
 */

router.post('/', [
  check('address', 'A valid ethereum address is required').exists().isLength({ min: 42, max: 42 })
],
  async (req, res, next) => {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      let userExists = await userServiceInstance.userExists(req.body)

      if (userExists) {
        return res.status(200).json({ message: 'User already exists' })
      }

      let user = await userServiceInstance.createUser(req.body);
      if (user) {
        return res.status(200).json({ message: 'User addedd successfully', data: user })
      } else {
        return res.status(400).json({ message: 'User addition failed' })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'Internal Server error. Please try again!' })
    }
  })


/**
 *  Gets all the user details 
 */

router.get('/', async (req, res, next) => {
  try {
    let users = await userServiceInstance.getUsers();
    if (users.length > 0) {
      return res.status(200).json({ message: 'Users retrieved successfully', data: users })
    } else {
      return res.status(404).json({ message: 'No user found' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error. Please try again!' })
  }
})


/**
 *  Gets single the user details 
 */

router.get('/:userId', verifyToken, async (req, res, next) => {
  try {
    let users = await userServiceInstance.getUser(req.params);
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
router.get('/:userId/tokens', async (req, res, next) => {
  try {
    let tokens = await userServiceInstance.getUsersTokens(req.params);
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
 *  Gets users own token orders(maker order)
 */
router.get('/:userId/maker-orders', async (req, res, next) => {
  try {
    let orders = await userServiceInstance.getUsersMakerOrders(req.params);
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
 *  Gets users buy token orders(taker order)
 */
router.get('/:userId/taker-orders', async (req, res, next) => {
  try {
    let orders = await userServiceInstance.getUsersTakerOrders(req.params);
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
router.get('/:userId/bids', async (req, res, next) => {
  try {
    let bids = await userServiceInstance.getUsersBids(req.params);
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
router.get('/:userId/favorites', async (req, res, next) => {
  try {
    let favorites = await userServiceInstance.getUsersFavorite(req.params);
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
 */
router.post('/:userId/favorites',
  [
    check('tokenId', 'A token id is required').exists()
  ],
  async (req, res, next) => {

    req.body['userId'] = req.params.userId
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    // implement token exists

    try {
      let favorites = await userServiceInstance.createUsersFavorite(req.body);
      if (favorites.length > 0) {
        return res.status(200).json({ message: 'User\'s favorites retrieved successfully', data: favorites })
      } else {
        return res.status(404).json({ message: 'Token not found' })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'Internal Server error. Please try again!' })
    }
  })


/**
*  Adds the address of a new user
*  @params address String
*/

router.post('/auth', [
  check('signature', 'A valid signature is required').exists(),
  check('userId', 'A valid id is required').exists()
],
  async (req, res, next) => {
    try {

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      let user = await userServiceInstance.getUser(req.body);

      if (!user) {
        return res.status(400).json({ message: 'User not found' })
      }

      if (auth.isValidSignature({ owner: user.address, signature: req.body.signature })) {
        var token = jwt.sign({ userId: user.id }, process.env.jwt_secret, {
          expiresIn: "24h"
        });
        return res.status(200).json({ message: 'User authorized successfully', data: user, auth_token: token })
      } else {
        return res.status(400).json({ message: 'User authorization failed' })
      }
    } catch (err) {
      console.log(err)
      return res.status(500).json({ message: 'Internal Server error. Please try again!' })
    }
  })

module.exports = router;