const jwt = require("jsonwebtoken");
const userService = require("../services/user");
let userServiceInstance = new userService();
let config = require("../../config/config");
let constants = require("../../config/constants");

async function verifyToken(req, res, next) {
  var token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res
      .status(200)
      .json({
        message: constants.MESSAGES.UNAUTHORIZED,
        data: { isAuthenticated: false },
      });
  }

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      return res
        .status(200)
        .json({
          message: constants.MESSAGES.UNAUTHORIZED,
          data: { isAuthenticated: false },
        });
    }

    if (!decoded.username) {
      let user = await userServiceInstance.getUser(decoded);
      if (!user) {
        return res
          .status(200)
          .json({
            message: constants.MESSAGES.UNAUTHORIZED,
            data: { isAuthenticated: false },
          });
      }
      req.userId = decoded.userId;
    }

    next();
  });
}

module.exports = verifyToken;
