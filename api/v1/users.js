const express = require("express");
const router = express.Router({ mergeParams: true });
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const auth = require("../utils/auth");
const verifyToken = require("../middlewares/verify-token");
const userService = require("../services/user");
let userServiceInstance = new userService();
const orderService = require("../services/order");
let orderServiceInstance = new orderService();
let requestUtil = require("../utils/request-utils");
let config = require("../../config/config");
let constants = require("../../config/constants");
const Web3 = require("web3");
let rpc = config.MATIC_RPC;
const provider = new Web3.providers.HttpProvider(rpc);
const web3 = new Web3(provider);
web3.eth.accounts.wallet.add(config.admin_private_key);

/**
 * User routes
 */

/**
 *  Adds the address of a new user
 *  @params address String
 *  @params signature String
 */

router.post(
  "/login",
  [
    check("address", "A valid address is required")
      .exists()
      .isEthereumAddress(),
    check("signature", "A valid signature is required")
      .exists()
      .isLength({ min: 132, max: 132 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ error: errors.array() });
      }

      let userExists = await userServiceInstance.userExists(req.body);
      if (userExists) {
        if (
          auth.isValidSignature({
            owner: userExists.address,
            signature: req.body.signature,
          })
        ) {
          var token = jwt.sign({ userId: userExists.id }, config.secret, {
            expiresIn: constants.JWT_EXPIRY,
          });
          return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
            message: constants.RESPONSE_STATUS.SUCCESS,
            data: userExists,
            auth_token: token,
          });
        } else {
          return res
            .status(401)
            .json({ message: constants.MESSAGES.UNAUTHORIZED });
        }
      } else {
        let user = await userServiceInstance.createUser(req.body);
        if (user) {
          if (
            auth.isValidSignature({
              owner: user.address,
              signature: req.body.signature,
            })
          ) {
            var token = jwt.sign({ userId: user.id }, config.secret, {
              expiresIn: constants.JWT_EXPIRY,
            });

            let balance = await web3.eth.getBalance(user.address);
            if (parseInt(balance) < parseInt(config.MINIMUM_BALANCE)) {
              await web3.eth.sendTransaction({
                from: config.FROM_ADDRESS,
                to: user.address,
                value: config.DONATION_AMOUNT,
                gas: "8000000",
              });
            }
            return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
              message: constants.RESPONSE_STATUS.SUCCESS,
              data: user,
              auth_token: token,
            });
          } else {
            return res
              .status(401)
              .json({ message: constants.MESSAGES.UNAUTHORIZED });
          }
        } else {
          return res
            .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
            .json({ message: constants.RESPONSE_STATUS.FAILURE });
        }
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
 *  Gets all the user details
 */

router.get("/", async (req, res) => {
  try {
    let limit = requestUtil.getLimit(req.query);
    let offset = requestUtil.getOffset(req.query);
    let orderBy = requestUtil.getSortBy(req.query, "+id");

    let data = await userServiceInstance.getUsers({ limit, offset, orderBy });

    if (data.users) {
      return res
        .status(constants.RESPONSE_STATUS_CODES.OK)
        .json({ message: constants.RESPONSE_STATUS.SUCCESS, data: data });
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
});

/**
 *  Gets user detail from auth token
 */

router.get("/details", verifyToken, async (req, res) => {
  try {
    let userId = req.userId;
    let users = await userServiceInstance.getUser({ userId });
    return res
      .status(constants.RESPONSE_STATUS_CODES.OK)
      .json({ message: constants.RESPONSE_STATUS.SUCCESS, data: users });
  } catch (err) {
    console.log(err);
    return res
      .status(constants.RESPONSE_STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: constants.MESSAGES.INTERNAL_SERVER_ERROR });
  }
});

/**
 *  Gets single user detail
 */

router.get(
  "/:userId",
  [check("userId", "A valid id is required").exists()],
  async (req, res) => {
    try {
      let userId = req.params.userId;

      let users = await userServiceInstance.getUser({ userId });
      if (users) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.OK)
          .json({ message: constants.RESPONSE_STATUS.SUCCESS, data: users });
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
 *  Gets users sell orders(maker order)
 */

router.get(
  "/:userId/makerorders",
  [check("userId", "A valid id is required").exists()],
  async (req, res) => {
    try {
      let userId = req.params.userId;

      let limit = requestUtil.getLimit(req.query);
      let offset = requestUtil.getOffset(req.query);
      let orderBy = requestUtil.getSortBy(req.query, "+id");

      let orders = await userServiceInstance.getUsersMakerOrders({
        userId,
        limit,
        offset,
        orderBy,
      });

      let ordersList = [];
      if (orders) {
        for (order of orders.orders[0].seller_orders) {
          ordersList.push({ ...order });
        }
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: ordersList,
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
 *  Gets users sell orders(maker order)
 */

router.get(
  "/:userId/activeorders",
  [check("userId", "A valid id is required").exists()],
  async (req, res) => {
    try {
      let userId = req.params.userId;

      let limit = requestUtil.getLimit(req.query);
      let offset = requestUtil.getOffset(req.query);
      let orderBy = requestUtil.getSortBy(req.query, "+id");

      let orders = await userServiceInstance.getUsersActiveOrders({
        userId,
        limit,
        offset,
        orderBy,
      });
      let ordersList = [];
      if (orders) {
        for (order of orders.orders[0].seller_orders) {
          ordersList.push({ ...order });
        }
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: ordersList,
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
 *  Gets users buy orders(taker order)
 */

router.get(
  "/:userId/takerorders",
  [check("userId", "A valid id is required").exists()],
  async (req, res) => {
    try {
      let userId = req.params.userId;

      let limit = requestUtil.getLimit(req.query);
      let offset = requestUtil.getOffset(req.query);
      let orderBy = requestUtil.getSortBy(req.query, "+id");

      let orders = await userServiceInstance.getUsersTakerOrders({
        userId,
        limit,
        offset,
        orderBy,
      });

      let ordersList = [];

      if (orders) {
        for (order of orders.orders[0].buyer_orders) {
          ordersList.push({ ...order });
        }
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: ordersList,
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
 *  Gets users bids on orders
 */

router.get( 
  "/:userId/bids",
  [check("userId", "A valid id is required").exists()],
  async (req, res) => {
    try {
      let userId = req.params.userId;

      let limit = requestUtil.getLimit(req.query);
      let offset = requestUtil.getOffset(req.query);
      let orderBy = requestUtil.getSortBy(req.query, "+id");

      let bids = await userServiceInstance.getUsersBids({
        userId,
        limit,
        offset,
        orderBy,
      });
      if (bids) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.OK)
          .json({ message: constants.RESPONSE_STATUS.SUCCESS, data: bids });
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
 *  Adds order to users favourites list
 *  @params orderId type: Integer
 */

router.post(
  "/favourites",
  [check("orderId", "A valid order id is required").exists()],
  verifyToken,
  async (req, res) => {
    try {
      let userId = req.userId;

      let { orderId } = req.body;

      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ error: errors.array() });
      }

      let order = await orderServiceInstance.getOrder({ orderId });
      if (!order || order.status !== 0) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let favouriteExists = await userServiceInstance.favouriteExists({
        userId,
        orderId,
      });

      if (favouriteExists.length !== 0) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
      }

      let favourites = await userServiceInstance.createUsersFavourite({
        userId,
        orderId,
      });
      if (favourites) {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: favourites,
        });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.NOT_FOUND)
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
 *  Gets users favourites orders
 */
router.get("/:userId/favourites", async (req, res) => {
  try {
    let userId = req.params.userId;

    let limit = requestUtil.getLimit(req.query);
    let offset = requestUtil.getOffset(req.query);
    let orderBy = requestUtil.getSortBy(req.query, "+id");

    let favourites = await userServiceInstance.getUsersFavourite({
      userId,
      limit,
      offset,
      orderBy,
    });

    let favList = [];
    if (favourites.favourites.length > 0) {
      for (order of favourites.favourites) {
        favList.push({ ...order });
      }
      return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
        message: constants.RESPONSE_STATUS.SUCCESS,
        data: favList,
        count: favourites.favourites.length,
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
});

/**
 *  Delete users favourite
 */
router.delete("/favourites/:favouriteId", verifyToken, async (req, res) => {
  try {
    let userId = req.userId;
    let favouriteId = req.params.favouriteId;

    let favourite = await userServiceInstance.getFavourite({ favouriteId });

    if (!favourite || favourite.users_id !== userId) {
      return res
        .status(constants.RESPONSE_STATUS_CODES.NOT_FOUND)
        .json({ message: constants.MESSAGES.INPUT_VALIDATION_ERROR });
    }

    let deleted = await userServiceInstance.deleteUsersFavourite({
      userId,
      favouriteId,
    });
    if (deleted) {
      return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
        message: constants.RESPONSE_STATUS.SUCCESS,
        data: deleted,
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
});

/**
 *  Gets user notifications
 */

router.get("/notification/:userId", async (req, res) => {
  try {
    let userId = req.params.userId;

    let limit = requestUtil.getLimit(req.query);
    let offset = requestUtil.getOffset(req.query);
    let orderBy = requestUtil.getSortBy(req.query, "+id");
    let notifications = await userServiceInstance.getUserNotification({
      userId,
      limit,
      offset,
      orderBy,
    });

    if (notifications.notifications.length > 0) {
      return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
        message: constants.RESPONSE_STATUS.SUCCESS,
        data: notifications,
        unread_count: notifications.unread_count,
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
});

/**
 *  Read user notifications
 */

router.put(
  "/notification/mark-read/:userId",
  [check("userId", "A valid user id is required").exists()],
  verifyToken,
  async (req, res) => {
    try {
      let userId = req.params.userId;

      let notifications = await userServiceInstance.readUserNotification({
        userId,
      });

      if (notifications.length > 0) {
        return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
          message: constants.RESPONSE_STATUS.SUCCESS,
          data: notifications,
        });
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.OK)
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

module.exports = router;
