const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const TokenService = require("../services/tokens");
const tokenServiceInstance = new TokenService();
let redisCache = require("../utils/redis-cache");
let helper = require("../utils/helper");

/**
 * Token routes
 */

/**
 *  Gets all the token details on matic
 */

router.get(
  "/matic",
  [check("owner", "input a valid address").exists().isEthereumAddress()],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      let { owner } = req.query;
      let tokens = await tokenServiceInstance.getTokens({
        owner: owner.toLowerCase(),
      });

      let tokensOwned = [];

      if (tokens.length > 0) {
        for (token of tokens) {
          let metadata = await redisCache.getTokenData(
            token.token_id,
            token.contract
          );
          tokensOwned.push({ ...token, ...metadata });
        }

        return res.status(200).json({
          message: "Token balance retieved successfully",
          data: tokensOwned,
        });
      } else {
        return res.status(404).json({
          message: "No tokens found",
        });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal Server error.Please try again" });
    }
  }
);

/**
 *  Gets all the token details on ethereum
 */

router.get(
  "/ethereum",
  [check("owner", "input a valid address").exists().isEthereumAddress()],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      let { owner } = req.query;
      let tokens = await tokenServiceInstance.getTokens({
        owner: owner.toLowerCase(),
      });

      let tokensOwned = [];

      if (tokens.length > 0) {
        for (token of tokens) {
          let metadata = await redisCache.getTokenData(
            token.token_id,
            token.contract
          );
          tokensOwned.push({ ...token, ...metadata });
        }
        return res.status(200).json({
          message: "Token balance retieved successfully",
          data: tokensOwned,
        });
      } else {
        return res.status(404).json({
          message: "No tokens found",
        });
      }
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ message: "Internal Server error.Please try again" });
    }
  }
);

module.exports = router;
