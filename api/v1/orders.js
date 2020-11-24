const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const orderService = require("../services/order");
let orderServiceInstance = new orderService();
const erc20TokenService = require("../services/erc20-token");
let erc20TokenServiceInstance = new erc20TokenService();
const categoryService = require("../services/category");
let categoryServiceInstance = new categoryService();
const verifyToken = require("../middlewares/verify-token");
let requestUtil = require("../utils/request-utils");
let helper = require("../utils/helper");
let redisCache = require("../utils/redis-cache");
let constants = require("../../config/constants");

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

router.post(
  "/",
  [
    check("maker_token", "A valid id is required").exists(),
    check("chain_id", "A valid id is required").exists(),
    check("taker_token", "A valid id is required").exists(),
    check("type", "A valid type is required")
      .exists()
      .isIn([
        constants.ORDER_TYPES.FIXED,
        constants.ORDER_TYPES.NEGOTIATION,
        constants.ORDER_TYPES.AUCTION,
      ]),
  ],
  verifyToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ error: errors.array() });
      }

      let {
        maker_token,
        maker_token_id,
        taker_token_id,
        price: price,
        signature,
        taker_token,
        type,
        chain_id,
        min_price,
        expiry_date,
      } = req.body;

      let categoryType =
        type === constants.ORDER_TYPES.FIXED ? maker_token : taker_token;

      let category = await categoryServiceInstance.getCategory({
        categoryId: categoryType,
      });

      if (!category) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let erc20Type =
        type === constants.ORDER_TYPES.FIXED ? taker_token : maker_token;

      let erc20token = await erc20TokenServiceInstance.getERC20Token({
        id: erc20Type,
      });

      if (!erc20token) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.OK)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let tokenId =
        type === constants.ORDER_TYPES.FIXED ? maker_token_id : taker_token_id;

      let validOrder = await orderServiceInstance.checkValidOrder({
        userId: req.userId,
        tokenId,
      });

      if (validOrder) {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.MESSAGES.INPUT_VALIDATION_ERROR,
        });
      }

      let orderAdd;

      switch (type) {
        case constants.ORDER_TYPES.FIXED: {
          if (!price || !signature || !maker_token_id) {
            return res
              .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
              .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
          }
          orderAdd = await orderServiceInstance.placeFixedOrder({
            maker_address: req.userId,
            maker_token,
            maker_token_id,
            price,
            signature,
            taker_token,
            type,
            chain_id,
          });
          break;
        }
        case constants.ORDER_TYPES.NEGOTIATION: {
          if (!min_price || !price || !taker_token_id) {
            return res
              .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
              .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
          }
          orderAdd = await orderServiceInstance.placeNegotiationOrder({
            taker_address: req.userId,
            taker_token,
            taker_token_id,
            price,
            min_price,
            maker_token,
            type,
            chain_id,
          });
          break;
        }
        case constants.ORDER_TYPES.AUCTION: {
          if (!min_price || !expiry_date || !taker_token_id) {
            return res
              .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
              .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
          }
          orderAdd = await orderServiceInstance.placeAuctionOrder({
            taker_address: req.userId,
            taker_token,
            taker_token_id,
            expiry_date,
            min_price,
            maker_token,
            type,
            chain_id,
          });
          break;
        }
      }
      if (orderAdd) {
        helper.notify({
          userId: req.userId,
          message:
            "You placed a " +
            type +
            " sell order on " +
            category.name +
            " token",
          order_id: orderAdd.id,
        });
        return res
          .status(constants.RESPONSE_STATUS_CODES.OK)
          .json({ message: constants.RESPONSE_STATUS.SUCCESS, data: orderAdd });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.RESPONSE_STATUS.FAILURE });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
);

router.post("/executeMetaTx", async (req, res) => {
  const { intent, fnSig, from, contractAddress } = req.body;
  const txDetails = { intent, fnSig, from, contractAddress };
  let txResult;
  try {
    txResult = await helper.executeMetaTransaction(txDetails);
  } catch (err) {
    console.log(err);
    return res
      .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
  }
  return res
    .status(constants.RESPONSE_STATUS_CODES.OK)
    .json({ message: constants.RESPONSE_STATUS.SUCCESS, data: txResult });
});

/**
 *  Gets all the order details
 *  @params categoryId
 *  @params search
 *  @params filter
 */

router.get(
  "/",
  [check("categoryArray", "A valid id is required").exists()],
  async (req, res) => {
    try {
      let limit = requestUtil.getLimit(req.query);
      let offset = requestUtil.getOffset(req.query);
      let orderBy = requestUtil.getSortBy(req.query, "+id");

      let { categoryArray } = req.query;

      let orders = await orderServiceInstance.getOrders({
        categoryArray,
        limit,
        offset,
        orderBy,
      });

      let ordersList = [];

      if (orders) {
        for (order of orders.order) {
          let metadata = await redisCache.getTokenData(
            order.tokens_id,
            order.categories.categoriesaddresses[0].ethereum_address
          );
          ordersList.push({ ...order, ...metadata });
        }
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: {
            order: ordersList,
            limit: orders.limit,
            offset: orders.offset,
            has_next_page: orders.has_next_page,
          },
        });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.NOT_FOUND)
          .json({ message: constants.RESPONSE_STATUS.NOT_FOUND });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 *  Gets single order details
 *  @params orderId type: int
 */

router.get(
  "/:orderId",
  [check("orderId", "A valid id is required").exists()],
  async (req, res) => {
    try {
      let order = await orderServiceInstance.getOrder(req.params);
      if (order) {
        let metadata = await redisCache.getTokenData(
          order.tokens_id,
          order.categories.categoriesaddresses[0].ethereum_address
        );

        let limit = requestUtil.getLimit(req.query);
        let offset = requestUtil.getOffset(req.query);
        let orderBy = requestUtil.getSortBy(req.query, "+id");

        if (order.type !== constants.ORDER_TYPES.FIXED) {
          let bids = await orderServiceInstance.getBids({
            orderId: order.id,
            limit,
            offset,
            orderBy,
          });

          if (bids.order.length > 0) {
            order["highest_bid"] = bids.order[0].price;
            order["lowest_bid"] = bids.order[bids.order.length - 1].price;
          }
        } else {
          if (order.status !== 0) {
            order.signature = null;
          }
        }

        let orderData = { ...order, ...metadata };
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: orderData,
        });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.NOT_FOUND)
          .json({ message: constants.RESPONSE_STATUS.NOT_FOUND });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 *  Buy order
 *  @params orderId type: int
 *  @params bid type: string
 */

router.patch(
  "/:orderId/buy",
  [check("orderId", "A valid order id is required").exists()],
  verifyToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ error: errors.array() });
      }

      let orderId = req.params.orderId;
      let { bid, signature, taker_signature } = req.body;

      let order = await orderServiceInstance.orderExists({ orderId });

      if (!order || order.status !== 0) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      if (
        (order.type === constants.ORDER_TYPES.FIXED &&
          order.maker_address === req.userId) ||
        (order.type !== constants.ORDER_TYPES.FIXED &&
          order.taker_address === req.userId)
      ) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let category = await categoryServiceInstance.getCategory({
        categoryId: order.categories_id,
      });

      let erc20Token = await erc20TokenServiceInstance.getERC20Token({
        id: order.erc20tokens_id,
      });

      if (!order || order.status !== 0) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let orderAdd;

      switch (order.type) {
        case constants.ORDER_TYPES.FIXED: {
          orderAdd = await orderServiceInstance.buyFixedOrder({
            orderId,
            taker_address: req.userId,
            signature: order.signature,
            takerSign: taker_signature,
          });

          if (orderAdd) {
            helper.notify({
              userId: req.userId,
              message:
                "You bought a " +
                category.name +
                " token for " +
                orderAdd.taker_amount +
                " " +
                erc20Token.symbol,
              order_id: orderAdd.id,
            });
            helper.notify({
              userId: orderAdd.maker_address,
              message:
                "Your " +
                category.name +
                " token has been bought for " +
                orderAdd.taker_amount +
                " " +
                erc20Token.symbol,
              order_id: orderAdd.id,
            });
          }
          break;
        }
        case constants.ORDER_TYPES.NEGOTIATION: {
          if (!bid || !signature) {
            return res
              .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
              .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
          }

          if (bid > order.price) {
            return res
              .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
              .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
          }
          orderAdd = await orderServiceInstance.makeBid({
            orderId,
            bid,
            signature,
            maker_address: req.userId,
          });
          if (orderAdd) {
            helper.notify({
              userId: req.userId,
              message:
                "You made an offer of " +
                bid +
                " " +
                erc20Token.symbol +
                " on " +
                category.name +
                " token",
              order_id: orderAdd.id,
            });
            helper.notify({
              userId: orderAdd.taker_address,
              message:
                "An offer of " +
                bid +
                " " +
                erc20Token.symbol +
                " has been made on your " +
                category.name +
                " token",
              order_id: orderAdd.id,
            });
          }
          break;
        }
        case constants.ORDER_TYPES.AUCTION: {
          if (!bid || !signature) {
            return res
              .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
              .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
          }
          orderAdd = await orderServiceInstance.makeBid({
            orderId,
            bid,
            signature,
            maker_address: req.userId,
          });
          if (orderAdd) {
            helper.notify({
              userId: req.userId,
              message:
                "You placed a bid of " +
                bid +
                " on " +
                category.name +
                " token",
              order_id: orderAdd.id,
            });
            helper.notify({
              userId: orderAdd.taker_address,
              message:
                "A bid of " +
                bid +
                " has been placed on your " +
                category.name +
                " token",
              order_id: orderAdd.id,
            });
          }
          break;
        }
      }
      if (orderAdd) {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: orderAdd,
        });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.RESPONSE_STATUS.FAILURE });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 *  cancel order
 */

router.patch(
  "/:orderId/cancel",
  [check("orderId", "A valid id is required").exists()],
  verifyToken,
  async (req, res) => {
    try {
      let order = await orderServiceInstance.orderExists(req.params);

      if (!order || order.status !== 0) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.OK)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let cancel = await orderServiceInstance.cancelOrder({
        orderId: req.params.orderId,
        signature: order.signature,
        type: order.type,
        takerSign: req.body.taker_signature,
      });
      let category = await categoryServiceInstance.getCategory({
        categoryId: cancel.categories_id,
      });

      if (cancel) {
        helper.notify({
          userId: req.userId,
          message:
            "You cancelled your " +
            cancel.type +
            " sell order on " +
            category.name +
            " token",
          order_id: cancel.id,
        });
        return res
          .status(constants.RESPONSE_STATUS_CODES.OK)
          .json({ message: constants.RESPONSE_STATUS.SUCCESS, data: cancel });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.RESPONSE_STATUS.FAILURE });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 *  cancel bid
 */

router.patch(
  "/bid/:bidId/cancel",
  [check("bidId", "A valid id is required").exists()],
  verifyToken,
  async (req, res) => {
    try {
      let bid = await orderServiceInstance.bidExists(req.params);

      if (!bid || bid.status !== 0) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.OK)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let { bidId } = req.params;
      let { taker_signature } = req.body;

      let order = await orderServiceInstance.getOrder({
        orderId: bid.orders_id,
      });

      let category = await categoryServiceInstance.getCategory({
        categoryId: order.categories.id,
      });

      let cancel;
      if (order.type === constants.ORDER_TYPES.FIXED) {
        cancel = await orderServiceInstance.cancelBid({
          orderId: order.id,
          bidId,
          signature: bid.signature,
          takerSign: taker_signature,
        });
      }

      if (order.type === constants.ORDER_TYPES.NEGOTIATION) {
        cancel = await orderServiceInstance.clearBids({ bidId });
      }

      if (cancel) {
        helper.notify({
          userId: req.userId,
          message:
            "You cancelled your bid/offer on " + category.name + " token",
          order_id: order.id,
        });
        return res
          .status(constants.RESPONSE_STATUS_CODES.OK)
          .json({ message: constants.RESPONSE_STATUS.SUCCESS, data: cancel });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.RESPONSE_STATUS.FAILURE });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 *  Execute order
 *  @params orderId type: int
 *  @params maker_token type: int
 *  @params bid type: string
 */

router.patch(
  "/:bidId/execute",
  [check("bidId", "A valid bid id is required").exists()],
  verifyToken,
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ error: errors.array() });
      }

      let bid = await orderServiceInstance.bidExists(req.params);

      if (!bid || bid.status !== 0) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let order = await orderServiceInstance.getOrder({
        orderId: bid.orders_id,
      });

      let category = await categoryServiceInstance.getCategory({
        categoryId: order.categories.id,
      });

      let erc20Token = await erc20TokenServiceInstance.getERC20Token({
        id: order.erc20tokens.id,
      });

      let params = {
        orderId: order.id,
        maker_address: bid.users_id,
        maker_amount: bid.price,
        signature: bid.signature,
        takerSign: req.body.taker_signature,
      };

      if (
        !order ||
        order.status !== 0 ||
        (order.type !== constants.ORDER_TYPES.NEGOTIATION &&
          order.type !== constants.ORDER_TYPES.AUCTION)
      ) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.OK)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let orderExecute = await orderServiceInstance.executeOrder(params);

      if (orderExecute) {
        if (order.type !== constants.ORDER_TYPES.FIXED) {
          let limit = requestUtil.getLimit(req.query);
          let offset = requestUtil.getOffset(req.query);
          let orderBy = requestUtil.getSortBy(req.query, "+id");

          let bids = await orderServiceInstance.getBids({
            orderId: order.id,
            limit,
            offset,
            orderBy,
          });

          for (data of bids.order) {
            orderServiceInstance.clearBids({ bidId: data.id });
          }
        }

        helper.notify({
          userId: orderExecute.maker_address,
          message:
            "You bought a " +
            category.name +
            " token for " +
            orderExecute.maker_amount +
            " " +
            erc20Token.symbol,
          order_id: orderExecute.id,
        });
        helper.notify({
          userId: orderExecute.taker_address,
          message:
            "Your " +
            category.name +
            " token has been bought for " +
            orderExecute.maker_amount +
            " " +
            erc20Token.symbol,
          order_id: orderExecute.id,
        });
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: orderExecute.id,
        });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.RESPONSE_STATUS.FAILURE });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 *  Gets bid list from order
 *  @params orderId type: int
 */

router.get(
  "/bids/:orderId",
  [check("orderId", "A valid id is required").exists()],
  async (req, res) => {
    try {
      let orderId = req.params.orderId;
      let limit = requestUtil.getLimit(req.query);
      let offset = requestUtil.getOffset(req.query);
      let orderBy = requestUtil.getSortBy(req.query, "+id");

      let bids = await orderServiceInstance.getBids({
        orderId,
        limit,
        offset,
        orderBy,
      });
      if (bids.order) {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: bids,
        });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.NOT_FOUND)
          .json({ message: constants.RESPONSE_STATUS.NOT_FOUND });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 *  Gets zrx exchange data encoded
 *  @params orderId type: int
 */

router.get(
  "/exchangedata/encoded/",
  [check("orderId", "A valid id is required").exists()],
  async (req, res) => {
    try {
      let { orderId, functionName } = req.query;

      let order = await orderServiceInstance.orderExists({ orderId });

      if (!order || order.status !== 0) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let encodedData = helper.encodeExchangeData(
        JSON.parse(order.signature),
        functionName
      );
      return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
        message: constants.RESPONSE_STATUS.SUCCESS,
        data: encodedData,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 *  Gets zrx exchange data encoded
 *  @params orderId type: int
 */

router.get(
  "/exchangedata/encodedbid/",
  [check("bidId", "A valid id is required").exists()],
  async (req, res) => {
    try {
      let { bidId, functionName } = req.query;

      let bid = await orderServiceInstance.bidExists({ bidId });

      if (!bid || bid.status !== 0) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let encodedData = helper.encodeExchangeData(
        JSON.parse(bid.signature),
        functionName
      );
      return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
        message: constants.RESPONSE_STATUS.SUCCESS,
        data: encodedData,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 *  Validate order
 *  @params orderId type: int
 */

router.post(
  "/validate",
  [check("orderId", "A valid id is required").exists()],
  verifyToken,
  async (req, res) => {
    try {
      let { orderId } = req.body;

      let order = await orderServiceInstance.getOrder({ orderId });

      if (!order || order.status !== 0) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let userAddress = order.seller_users.address;
      let tokenId = order.tokens_id;
      let contractAddress = order.categories.categoriesaddresses[0].address;

      let valid = await helper.checkOwnerShip(
        userAddress,
        tokenId,
        contractAddress
      );

      if(!valid){
        await orderServiceInstance.expireOrder({orderId})
      }

      return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
        message: constants.RESPONSE_STATUS.SUCCESS,
        data: valid,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
);

/**
 *  Validate bids
 *  @params orderId type: int
 */

router.post(
  "/validate/bids",
  [check("orderId", "A valid id is required").exists()],
  verifyToken,
  async (req, res) => {
    try {
      let { orderId } = req.body;

      let order = await orderServiceInstance.getOrder({ orderId });

      if (!order || order.status !== 0) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let bids = await orderServiceInstance.getBids({
        orderId,
      });

      for (data of bids.order) {
        let signedOrder = JSON.parse(data.signature);
        if (
          !(await helper.checkTokenBalance(
            signedOrder.makerAddress,
            signedOrder.makerAssetAmount,
            data.orders.erc20tokens.erc20tokensaddresses[0].address
          ))
        ) {
          await orderServiceInstance.clearBids({ bidId: data.id });
        }
      }

      return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
        message: constants.RESPONSE_STATUS.SUCCESS,
        data: bids,
      });
    } catch (err) {
      console.log(err);
      return res
        .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
        .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
    }
  }
);

module.exports = router;
