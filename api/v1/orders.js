const express = require('express')
const router = express.Router();
const { check, validationResult } = require('express-validator');
const orderService = require('../services/order')
let orderServiceInstance = new orderService();
const erc20TokenService = require('../services/erc20-token')
let erc20TokenServiceInstance = new erc20TokenService();
const categoryService = require('../services/category')
let categoryServiceInstance = new categoryService();
const verifyToken = require('../middlewares/verify-token')
let requestUtil = require('../utils/request-utils')

/**
 * Order routes
 */

/**
 *  Create a new order
 *  @params maker_token type: Integer
 *  @params maker_token_id type: String
 *  @params taker_token type: Integer
 *  @params signature type: String
 *  @params type type: String
 *  @params price type: String
 *  @params min_price type: String
 *  @params expiry type: Integer
 *  @params chainw_id type: String
 */

router.post('/', [
  check('maker_token', 'A valid id is required').exists(),
  check('chain_id', 'A valid id is required').exists(),
  check('maker_token_id', 'A valid id is required').exists(),
  check('taker_token', 'A valid id is required').exists(),
  check('signature', 'A valid signature is required').exists().isLength({ min: 132, max: 132 }),
  check('type', 'A valid type is required').exists().isIn(['FIXED', 'NEGOTIATION', 'AUCTION']),
], verifyToken, async (req, res) => {

  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let params = { ...req.body, ...{ maker_address: req.userId } }

    let { maker_token, maker_token_id, taker_token, type } = req.body;

    let category = await categoryServiceInstance.getCategory({ categoryId: maker_token })

    if (!category) {
      return res.status(400).json({ message: 'Invalid Category' })
    }

    let erc20token = await erc20TokenServiceInstance.getERC20Token({ id: taker_token })

    if (!erc20token) {
      return res.status(200).json({ message: 'Invalid Token' })
    }

    let orderAdd;

    switch (type) {
      case 'FIXED': {
        if (!params.price) {
          return res.status(400).json({ message: 'Input validation failed' })
        }
        orderAdd = await orderServiceInstance.placeFixedOrder(params)
        break;
      }
      case 'NEGOTIATION': {
        if (!params.min_price || !params.price) {
          return res.status(400).json({ message: 'Input validation failed' })
        }
        orderAdd = await orderServiceInstance.placeNegotiationOrder(params)
        break;
      }
      case 'AUCTION': {
        if (!params.min_price || !params.expiry_date) {
          return res.status(400).json({ message: 'Input validation failed' })
        }
        orderAdd = await orderServiceInstance.placeAuctionOrder(params)
        break;
      }
    }
    if (orderAdd) {
      return res.status(200).json({ message: 'Sell Order addedd successfully', data: orderAdd.id })
    } else {
      return res.status(400).json({ message: 'Sell Order creation failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})


/**
 *  Gets all the order details 
 *  @params categoryId
 *  @params search
 *  @params filter
 */

router.get('/', [
  check('categoryArray', 'A valid id is required').exists(),
], async (req, res) => {
  try {

    let limit = requestUtil.getLimit(req.query)
    let offset = requestUtil.getOffset(req.query)
    let orderBy = requestUtil.getSortBy(req.query, '+id')

    let { categoryArray } = req.query;

    let orders = await orderServiceInstance.getOrders({ categoryArray, limit, offset, orderBy });
    if (orders) {
      return res.status(200).json({ message: 'Orders retrieved successfully', data: orders })
    } else {
      return res.status(400).json({ message: 'Orders do not exist' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})

/**
 *  Gets single order details 
 *  @params orderId type: int
 */

router.get('/:orderId', [
  check('orderId', 'A valid id is required').exists()
], async (req, res) => {
  try {

    let order = await orderServiceInstance.getOrder(req.params);
    if (order) {
      return res.status(200).json({ message: 'Order details retrieved successfully', data: order })
    } else {
      return res.status(400).json({ message: 'Order does not exist' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})

/**
 *  Buy order
 *  @params orderId type: int
 *  @params bid type: string
 */

router.patch('/:orderId/buy', [
  check('orderId', 'A valid order id is required').exists(),
], verifyToken, async (req, res) => {

  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let params = { ...req.body, ...req.params, ...{ taker_address: req.userId } }

    let order = await orderServiceInstance.orderExists(params);

    if (!order || order.status !== 0) {
      return res.status(200).json({ message: 'Invalid order' })
    }

    let orderAdd;

    switch (order.type) {
      case 'FIXED': {

        orderAdd = await orderServiceInstance.buyFixedOrder(params)
        break;

      }
      case 'NEGOTIATION':
      case 'AUCTION':
        {

          if (!params.bid) {
            return res.status(400).json({ message: 'Input validation failed' })
          }
          orderAdd = await orderServiceInstance.makeBid(params)
          break;

        }

    }
    if (orderAdd) {
      return res.status(200).json({ message: 'Buy order placed successfully', data: orderAdd.id })
    } else {
      return res.status(400).json({ message: 'Buy order failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})

/**
 *  cancel order 
 */

router.patch('/:orderId/cancel', [
  check('orderId', 'A valid id is required').exists()
], verifyToken, async (req, res) => {
  try {


    let order = await orderServiceInstance.orderExists(req.params);

    if (!order || order.status !== 0) {
      return res.status(200).json({ message: 'Invalid order' })
    }

    let cancel = await orderServiceInstance.cancelOrder(req.params);
    if (cancel) {
      return res.status(200).json({ message: 'Order cancelled successfully', data: cancel })
    } else {
      return res.status(400).json({ message: 'Order cancellation failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})

/**
 *  cancel bid 
 */

router.patch('/bid/:bidId/cancel', [
  check('bidId', 'A valid id is required').exists()
], verifyToken, async (req, res) => {
  try {

    let bid = await orderServiceInstance.bidExists(req.params);

    if (!bid || bid.status !== 0) {
      return res.status(200).json({ message: 'Invalid bid' })
    }

    let cancel = await orderServiceInstance.cancelBid(req.params);
    if (cancel) {
      return res.status(200).json({ message: 'bid cancelled successfully', data: cancel })
    } else {
      return res.status(400).json({ message: 'bid cancel failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})

/**
 *  Execute order
 *  @params orderId type: int
 *  @params maker_token type: int
 *  @params bid type: string
 */

router.patch('/:orderId/execute', [
  check('orderId', 'A valid order id is required').exists(),
  check('taker_amount', 'A valid amount is required').exists()
], verifyToken, async (req, res) => {

  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let params = { ...req.body, ...req.params, ...{ taker_address: req.userId } }

    let order = await orderServiceInstance.orderExists(req.params);

    if (!order || order.status !== 0 || (order.type !== 'NEGOTIATION' && order.type !== 'AUCTION')) {
      return res.status(200).json({ message: 'Invalid order' })
    }

    let orderExecute = await orderServiceInstance.executeOrder(params)

    if (orderExecute) {
      return res.status(200).json({ message: 'Order addedd successfully', data: orderExecute.id })
    } else {
      return res.status(400).json({ message: 'Order addition failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})


module.exports = router;
