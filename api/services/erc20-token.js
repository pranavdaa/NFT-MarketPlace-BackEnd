const prisma = require("../../prisma")
let { hasNextPage } = require("../utils/request-utils");
let constants = require("../../config/constants");

/**
 * Includes all the erc20token services that controls
 * the erc20token Data object from the database
 */

class ERC20TokenService {
  async addERC20Token(params) {
    let { name, decimal, symbol, address } = params;
    try {
      let erc20Token = await prisma.erc20tokens.create({
        data: {
          name: name,
          decimal: parseInt(decimal),
          symbol: symbol,
          erc20tokensaddresses: {
            create: JSON.parse(address),
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
      let { symbol } = params;
      let erc20Tokens = await prisma.erc20tokens.findOne({
        where: { symbol: symbol },
      });
      return erc20Tokens;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async erc20TokenAddressExists(params) {
    try {
      let { address } = params;
      let erc20Tokens = await prisma.erc20tokensaddresses.findOne({
        where: { address: address },
      });
      return erc20Tokens;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getERC20Token(params) {
    try {
      let { id } = params;
      let erc20Tokens = await prisma.erc20tokens.findOne({
        where: { id: parseInt(id) },
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
      let { name: params_name, decimal: params_decimal, market_price: params_market_price } = params
      let { decimal: current_decimal, market_price: current_market_price, name: current_name } = current
      let category = await prisma.erc20tokens.update({
        where: { id: parseInt(params.id) },
        data: {
          name: params_name ? params.name : current_name,
          decimal: params_decimal ? parseInt(params_decimal) : current_decimal,
          market_price: params_market_price
            ? (params_market_price)
            : current_market_price,
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
