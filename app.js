const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./config/config");
const routeV1 = require("./api/v1/");
const verifyToken = require("./api/middlewares/verify-token-config");
const userService = require("./api/services/user");
let userServiceInstance = new userService();

/**
 * Root route, middlewares
 */

var app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/public", express.static("public"));

if (config.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

app.use(cors());

app.use("/api/v1", routeV1);

//Config API

 app.get("/api/v1/config", verifyToken, async (req, res) => {
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

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

module.exports = app;
