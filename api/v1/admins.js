const express = require("express");
const router = express.Router({ mergeParams: true });
const { check, validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const adminService = require("../services/admin");
let adminServiceInstance = new adminService();
let config = require("../../config/config");
let constants = require("../../config/constants");

/**
 * admin routes
 */

/**
 *   Admin Login
 *  @params username String
 *  @params signature String
 */

router.post(
  "/login",
  [
    check("username", "A valid username is required").exists(),
    check("password", "A valid password is required").exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res
          .status(constants.RESPONSE_STATUS_CODES.BAD_REQUEST)
          .json({ error: errors.array() });
      }

      let admin = await adminServiceInstance.getAdmin(req.body);
      if (admin) {
        let passwordCheck = await bcrypt.compareSync(
          req.body.password,
          admin.password
        );
        if (passwordCheck) {
          var token = jwt.sign({ username: admin.username }, config.secret, {
            expiresIn: constants.JWT_EXPIRY,
          });
          return res.status(constants.RESPONSE_STATUS_CODES.OK).json({
            message: constants.MESSAGES.LOGIN_SUCCESS,
            data: admin,
            auth_token: token,
          });
        } else {
          return res
            .status(constants.RESPONSE_STATUS_CODES.UNAUTHORIZED)
            .json({ message: constants.MESSAGES.INVALID_CREDENTIALS });
        }
      } else {
        return res
          .status(constants.RESPONSE_STATUS_CODES.UNAUTHORIZED)
          .json({ message: constants.MESSAGES.INVALID_CREDENTIALS });
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
