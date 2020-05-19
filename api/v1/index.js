const express = require('express')
const router = express.Router();
const categories = require('./categories')
const users = require('./users')
const orders = require('./orders')
const tokens = require('./tokens')

/**
 * Routes
 */

router.use('/categories', categories)
router.use('/users', users)
router.use('/order', orders)
router.use('/tokens', tokens)

module.exports = router;