const express = require('express')
const router = express.Router();
const { query, body, validationResult } = require('express-validator');
const OrderService = require('../services/orderService')
let orderServiceInstance = new OrderService();

/**
 * Order routes
 */

/**
 *  Create a new order
 *  @params maker_address type: int
 *  @params maker_token_id type: int
 *  @params maker_token type: int
 *  @params signature type: string
 *  @params order_type type: string
 *  @params min_price type: float
 *  @params expiry type: timestamp
 */

router.post('/', [
  body('maker_address', 'A valid address is required').exists(),
  body('maker_token_id', 'A valid id time is required').exists(),
  body('maker_token', 'A valid id is required').exists(),
  body('taker_token', 'A valid id is required').exists(),
  body('signature', 'A valid signature is required').exists(),
  body('type', 'A valid type is required').exists().isIn(['FIXED', 'NEGOTIATION', 'AUCTION']),
], async (req, res, next) => {

  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let params = req.body;
    let orderAdd;

    switch (params.type) {
      case 'FIXED': {
        if (!params.price) {
          return res.status(400).json({ message: 'input validation failed' })
        }
        orderAdd = await orderServiceInstance.placeFixedOrder(params)
        break;
      }
      case 'NEGOTIATION': {
        if (!params.min_price || !params.price) {
          return res.status(400).json({ message: 'input validation failed' })
        }
        orderAdd = await orderServiceInstance.placeNegotiationOrder(params)
        break;
      }
      case 'AUCTION': {
        if (!params.min_price || !params.expiry_date) {
          return res.status(400).json({ message: 'input validation failed' })
        }
        orderAdd = await orderServiceInstance.placeAuctionOrder(params)
        break;
      }
    }
    if (orderAdd) {
      return res.status(200).json({ message: 'order addedd successfully', data: orderAdd.id })
    } else {
      return res.status(400).json({ message: 'order addition failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})


/**
 *  Gets all the order details 
 */

router.get('/', async (req, res, next) => {
  try {

    let orders = await orderServiceInstance.getOrders();
    if (orders) {
      return res.status(200).json({ message: 'orders retrieved successfully', data: orders })
    } else {
      return res.status(400).json({ message: 'order retrieved failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})

module.exports = router;