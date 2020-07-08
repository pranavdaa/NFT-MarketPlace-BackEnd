const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const TokenService = require("../services/tokens");
const tokenServiceInstance = new TokenService();

/**
 * Token routes
 */

/**
 *  Gets all the token details
 */

router.get(
  "/",
  [check("owner", "input a valid address").exists().isEthereumAddress()],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      let { owner } = req.query;
      let tokens = await tokenServiceInstance.getTokens({ owner });

      if (tokens.length > 0) {
        return res.status(200).json({
          message: "Token balance retieved successfully",
          data: tokens,
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
 *  Gets single token detail
 *  @param id type: integer
 */

router.get(
  "/:tokenId",
  [
    check("tokenId", "A valid id is required").exists(),
    check("contract", "A valid id is required").exists().isEthereumAddress(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
      }

      let tokenId = req.params.tokenId;
      let contract = req.query.contract;

      let token = await tokenServiceInstance.getTokenDetail({
        token_id: tokenId,
        contract: contract,
      });
      if (token) {
        return res.status(200).json({
          message: "Token detail retieved successfully",
          data: token,
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
