const express = require('express')
const router = express.Router();
const categories = require('./categories')
const users = require('./users')
const orders = require('./orders')
const tokens = require('./tokens')
const erc20tokens = require('./erc20tokens')

/**
 * Routes
 */

router.use('/categories', categories)
router.use('/users', users)
router.use('/orders', orders)
router.use('/tokens', tokens)
router.use('/erc20tokens', erc20tokens)

module.exports = router;
