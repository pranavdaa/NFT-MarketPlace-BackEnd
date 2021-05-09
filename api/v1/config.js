const express = require("express");
const router = express.Router();
const verifyToken = require("../middlewares/verify-token-config");
const userService = require("../services/user");
let userServiceInstance = new userService();
let constants = require("../../config/constants");



//Config API

router.get("/", verifyToken, async (req, res) => {
    try {
      let userId = req.userId;
      let users = await userServiceInstance.getUser({ userId });
  
      users.isAuthenticated = true;
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


  module.exports = router;
