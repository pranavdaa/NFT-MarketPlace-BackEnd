const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

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
            create: JSON.parse(params.address)
          }
        }
      })
      return erc20Token;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async getERC20Tokens() {
    try {

      let erc20Tokens = await prisma.erc20tokens.findMany({
        include: { erc20tokensaddresses: true }
      });
      return erc20Tokens;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async erc20TokenExists(params) {
    try {

      let erc20Tokens = await prisma.erc20tokens.findOne({
        where: { symbol: params.symbol }
      });
      return erc20Tokens;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async erc20TokenAddressExists(params) {
    try {

      let erc20Tokens = await prisma.erc20tokensaddresses.findOne({
        where: { address: params.address }
      });
      return erc20Tokens;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async getERC20Token(params) {
    try {

      let erc20Tokens = await prisma.erc20tokens.findOne({
        where: { id: parseInt(params.id) }
      });
      return erc20Tokens;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async updateERC20Token(params) {

    try {

      let current = await this.geterc20token(params);
      let category = await prisma.erc20tokens.update({
        where: { id: parseInt(params.id) },
        data: {
          name: params.name ? params.name : current.name,
          decimal: params.decimal ? parseInt(params.decimal) : current.decimal,
          erc20tokensaddresses: {
            create: params.address ? JSON.parse(params.address) : []
          }
        }
      })
      return category;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }
}

module.exports = ERC20TokenService

