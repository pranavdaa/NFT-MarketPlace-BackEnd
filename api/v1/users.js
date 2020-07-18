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
        return res.status(400).json({ error: errors.array() });
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
            expiresIn: "24h",
          });
          return res.status(200).json({
            message: "User authorized successfully",
            data: userExists,
            auth_token: token,
          });
        } else {
          return res.status(401).json({ message: "User authorization failed" });
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
              expiresIn: "24h",
            });
            return res.status(200).json({
              message: "User added and authorized successfully",
              data: user,
              auth_token: token,
            });
          } else {
            return res
              .status(401)
              .json({ message: "User authorization failed" });
          }
        } else {
          return res.status(400).json({ message: "User creation failed" });
        }
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal Server error. Please try again!" });
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
        .status(200)
        .json({ message: "Users retrieved successfully", data: data });
    } else {
      return res.status(404).json({ message: "No user found" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal Server error. Please try again!" });
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
      .status(200)
      .json({ message: "Users retrieved successfully", data: users });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal Server error. Please try again!" });
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
          .status(200)
          .json({ message: "Users retrieved successfully", data: users });
      } else {
        return res.status(404).json({ message: "User not found" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal Server error. Please try again!" });
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
      if (orders) {
        return res.status(200).json({
          message: "User's orders retrieved successfully",
          data: orders,
        });
      } else {
        return res.status(404).json({ message: "User's orders not found" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal Server error. Please try again!" });
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
      if (orders) {
        return res.status(200).json({
          message: "User's orders retrieved successfully",
          data: orders,
        });
      } else {
        return res.status(404).json({ message: "User's orders not found" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal Server error. Please try again!" });
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
          .status(200)
          .json({ message: "User's bids retrieved successfully", data: bids });
      } else {
        return res.status(404).json({ message: "User's bids not found" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal Server error. Please try again!" });
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
        return res.status(400).json({ error: errors.array() });
      }

      let order = await orderServiceInstance.getOrder({ orderId });
      if (!order || order.status !== 0) {
        return res.status(400).json({ message: "Invalid Order Id" });
      }

      let favouriteExists = await userServiceInstance.favouriteExists({
        userId,
        orderId,
      });

      if (favouriteExists.length !== 0) {
        return res
          .status(400)
          .json({ message: "User's favourites already exists" });
      }

      let favourites = await userServiceInstance.createUsersFavourite({
        userId,
        orderId,
      });
      if (favourites) {
        return res.status(200).json({
          message: "User's favourites added successfully",
          data: favourites,
        });
      } else {
        return res
          .status(404)
          .json({ message: "User's favourites addition failed" });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal Server error. Please try again!" });
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
    if (favourites) {
      return res.status(200).json({
        message: "User's favourites retrieved successfully",
        data: favourites,
      });
    } else {
      return res.status(404).json({ message: "Favourite orders not found" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal Server error. Please try again!" });
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
      return res.status(404).json({ message: "Favourite doesnot exist" });
    }

    let deleted = await userServiceInstance.deleteUsersFavourite({
      userId,
      favouriteId,
    });
    if (deleted) {
      return res.status(200).json({
        message: "User's favourites deleted successfully",
        data: deleted,
      });
    } else {
      return res.status(400).json({ message: "Favourite deletion failed" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal Server error. Please try again!" });
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
      return res.status(200).json({
        message: "notifications retrieved successfully",
        data: notifications,
      });
    } else {
      return res.status(404).json({ message: "notifications not found" });
    }
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ message: "Internal Server error. Please try again!" });
  }
});

module.exports = router;
