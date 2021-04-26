const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const cors = require("cors");
const config = require("./config/config");
const routeV1 = require("./api/v1/");


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
