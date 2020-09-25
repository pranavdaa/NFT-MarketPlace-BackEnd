const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
let { hasNextPage } = require("../utils/helper.js");
let constants = require("../../config/constants");

/**
 * Includes all the erc20token services that controls
 * the erc20token Data object from the database
 */

class ERC20TokenService {
  async addERC20Token(params) {
    try {
      let erc20Token = await prisma.erc20tokens.create({
        data: {
          name: params.name,
          decimal: parseInt(params.decimal),
          symbol: params.symbol,
          erc20tokensaddresses: {
            create: JSON.parse(params.address),
          },
        },
      });
      return erc20Token;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getERC20Tokens({ limit, offset, orderBy }) {
    try {
      let where = {
        active: true,
      };

      let count = await prisma.erc20tokens.count({ where });
      let erc20Tokens = await prisma.erc20tokens.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
        include: { erc20tokensaddresses: true },
      });
      return {
        erc20Tokens,
        limit,
        offset,
        has_next_page: hasNextPage({ limit, offset, count }),
      };
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getERC20TokenList() {
    try {
      let where = {
        active: true,
      };

      let erc20Tokens = await prisma.erc20tokens.findMany({
        where,
      });
      return erc20Tokens;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async erc20TokenExists(params) {
    try {
      let erc20Tokens = await prisma.erc20tokens.findOne({
        where: { symbol: params.symbol },
      });
      return erc20Tokens;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async erc20TokenAddressExists(params) {
    try {
      let erc20Tokens = await prisma.erc20tokensaddresses.findOne({
        where: { address: params.address },
      });
      return erc20Tokens;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getERC20Token(params) {
    try {
      let erc20Tokens = await prisma.erc20tokens.findOne({
        where: { id: parseInt(params.id) },
        include: { erc20tokensaddresses: true },
      });
      return erc20Tokens;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateERC20Token(params) {
    try {
      let current = await this.getERC20Token(params);

      let category = await prisma.erc20tokens.update({
        where: { id: parseInt(params.id) },
        data: {
          name: params.name ? params.name : current.name,
          decimal: params.decimal ? parseInt(params.decimal) : current.decimal,
          market_price: params.market_price
            ? parseFloat(params.market_price)
            : current.market_price,
        },
      });
      return category;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = ERC20TokenService;
