const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/**
 * Includes all the erc20token services that controls
 * the erc20token Data object from the database
 */

class Erc20tokenService {

  async adderc20token(params) {

    try {

      let erc20token = await prisma.erc20tokens.create({
        data: {
          name: params.name,
          decimal: parseInt(params.decimal),
          symbol: params.symbol,
          erc20tokensaddresses: {
            create: JSON.parse(params.address)
          }
        }
      })
      return erc20token;
    } catch (err) {
      throw err;
    }
  }

  async geterc20tokens() {
    try {

      let erc20tokens = await prisma.erc20tokens.findMany({
        include: { erc20tokensaddresses: true }
      });
      return erc20tokens;
    } catch (err) {
      throw err;
    }
  }

  async erc20tokenExists(params) {
    try {

      let erc20tokens = await prisma.erc20tokens.findOne({
        where: { symbol: params.symbol }
      });
      return erc20tokens;
    } catch (err) {
      throw err;
    }
  }

  async erc20tokenAddressExists(params) {
    try {

      let erc20tokens = await prisma.erc20tokensaddresses.findOne({
        where: { address: params.address }
      });
      return erc20tokens;
    } catch (err) {
      throw err;
    }
  }

  async geterc20token(params) {
    try {

      let erc20tokens = await prisma.erc20tokens.findOne({
        where: { id: parseInt(params.id) }
      });
      return erc20tokens;
    } catch (err) {
      throw err;
    }
  }

  async updateerc20token(params) {

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
      throw err;
    }
  }
}

module.exports = Erc20tokenService

