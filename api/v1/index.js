const express = require("express");
const router = express.Router();
const categories = require("./categories");
const users = require("./users");
const orders = require("./orders");
const tokens = require("./tokens");
const erc20tokens = require("./erc20-tokens");
const admins = require("./admins");
const config = require("./config");
const assetMigrate = require("./asset-migrate");

/**
 * Routes
 */

router.use("/categories", categories);
router.use("/users", users);
router.use("/orders", orders);
router.use("/tokens", tokens);
router.use("/erc20tokens", erc20tokens);
router.use("/admins", admins);
router.use("/config", config);
router.use("/assetmigrate", assetMigrate);

module.exports = router;
