const express = require('express')
const router = express.Router();
const { check, validationResult } = require('express-validator');
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
  check('maker_address', 'A valid address is required').exists(),
  check('maker_token_id', 'A valid id time is required').exists(),
  check('maker_token', 'A valid id is required').exists(),
  check('taker_token', 'A valid id is required').exists(),
  check('signature', 'A valid signature is required').exists(),
  check('type', 'A valid type is required').exists().isIn(['FIXED', 'NEGOTIATION', 'AUCTION']),
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

/**
 *  Gets single order details 
 */

router.get('/:id', async (req, res, next) => {
  try {

    let order = await orderServiceInstance.getOrder(req.params);
    if (order) {
      return res.status(200).json({ message: 'order retrieved successfully', data: order })
    } else {
      return res.status(400).json({ message: 'orde retrieved failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})

/**
 *  Buy order
 *  @params taker_address type: int
 *  @params id type: int
 *  @params maker_token type: int
 *  @params bid type: string
 */

router.patch('/:id/buy', [
  check('id', 'A valid order id is required').exists(),
  check('taker_address', 'A valid address is required').exists(),
], async (req, res, next) => {

  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let order = await orderServiceInstance.orderExists(req.params);

    if (!order || order.status !== 0) {
      return res.status(200).json({ message: 'Invalid order' })
    }

    let params = req.params;
    let orderAdd;

    switch (params.type) {
      case 'FIXED': {

        orderAdd = await orderServiceInstance.buyFixedOrder(params, req.body)
        break;

      }
      case 'NEGOTIATION':
      case 'AUCTION':
        {

          if (!params.bid) {
            return res.status(400).json({ message: 'input validation failed' })
          }
          orderAdd = await orderServiceInstance.makeBid(params, req.body)
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
 *  cancel order 
 */

router.patch('/cancelbid/:id', async (req, res, next) => {
  try {


    let order = await orderServiceInstance.orderExists(req.params);

    if (!order || order.status !== 0) {
      return res.status(200).json({ message: 'Invalid order' })
    }

    let cancel = await orderServiceInstance.cancelBid(req.params);
    if (cancel) {
      return res.status(200).json({ message: 'order cancelled successfully', data: cancel })
    } else {
      return res.status(400).json({ message: 'orde cancel failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})

/**
 *  cancel bid 
 */

router.patch('/bid/:id/cancel', async (req, res, next) => {
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
 *  Buy order
 *  @params taker_address type: int
 *  @params id type: int
 *  @params maker_token type: int
 *  @params bid type: string
 */

router.patch('/:id/execute', [
  check('id', 'A valid order id is required').exists(),
  check('taker_address', 'A valid address is required').exists(),
  check('take_amount', 'A valid amount is required').exists()
], async (req, res, next) => {

  try {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array() });
    }

    let order = await orderServiceInstance.orderExists(req.params);

    if (!order || order.status !== 0 || (order.type !== 'NEGOTIATION' && order.type !== 'AUCTION')) {
      return res.status(200).json({ message: 'Invalid order' })
    }

    let params = req.params;

    if (!params.bid) {
      return res.status(400).json({ message: 'input validation failed' })
    }
    let orderExecute = await orderServiceInstance.executeOrder(params, req.body)

    if (orderExecute) {
      return res.status(200).json({ message: 'order addedd successfully', data: orderExecute.id })
    } else {
      return res.status(400).json({ message: 'order addition failed' })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server error.Please try again' })
  }
})


module.exports = router;