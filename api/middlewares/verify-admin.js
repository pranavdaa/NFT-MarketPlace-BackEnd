const jwt = require("jsonwebtoken");
const adminService = require("../services/admin");
let adminServiceInstance = new adminService();
let config = require("../../config/config");
let constants = require("../../config/constants");

async function verifyToken(req, res, next) {
  var token = req.headers["x-access-token"] || req.headers["authorization"];

  if (!token) {
    return res.status(401).json({ message: constants.MESSAGES.UNAUTHORIZED });
  }

  jwt.verify(token, config.secret, async (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: constants.MESSAGES.UNAUTHORIZED });
    }
    let admin = await adminServiceInstance.getAdmin(decoded);
    if (!admin) {
      return res.status(401).json({ message: constants.MESSAGES.UNAUTHORIZED });
    }
    next();
  });
}

module.exports = verifyToken;
