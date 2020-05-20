const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/**
 * Includes all the Order services that controls
 * the Order Data object from the database
 */

class OrderService {

  async placeFixedOrder(params) {
    try {
      let order = await prisma.orders.create({
        data: {
          maker_users: { connect: { id: parseInt(params.maker_address) } },
          categories: { connect: { id: parseInt(params.maker_token) } },
          tokens: { connect: { id: parseInt(params.maker_token_id) } },
          price: params.price,
          min_price: params.price,
          signature: params.signature,
          erc20tokens: { connect: { id: parseInt(params.taker_token) } },
          type: params.type,
        }
      })
      return order;
    } catch (err) {
      throw err;
    }
  }

  async placeNegotiationOrder(params) {

    try {
      let order = await prisma.orders.create({
        data: {
          maker_users: { connect: { id: parseInt(params.maker_address) } },
          categories: { connect: { id: parseInt(params.maker_token) } },
          tokens: { connect: { id: parseInt(params.maker_token_id) } },
          min_price: params.min_price,
          price: params.price,
          signature: params.signature,
          erc20tokens: { connect: { id: parseInt(params.taker_token) } },
          type: params.type,
        }
      })
      return order;
    } catch (err) {
      throw err;
    }
  }

  async placeAuctionOrder(params) {

    try {
      let order = await prisma.orders.create({
        data: {
          expiry_date: new Date(parseInt(params.expiry_date)),
          maker_users: { connect: { id: parseInt(params.maker_address) } },
          categories: { connect: { id: parseInt(params.maker_token) } },
          tokens: { connect: { id: parseInt(params.maker_token_id) } },
          min_price: params.min_price,
          price: params.min_price,
          signature: params.signature,
          erc20tokens: { connect: { id: parseInt(params.taker_token) } },
          type: params.type,
        }
      })
      return order;
    } catch (err) {
      throw err;
    }
  }

  async getOrders() {
    try {
      let order = await prisma.orders.findMany({
        where: {
          status: 0
        },
        select: {
          id: true,
          created: true,
          min_price: true,
          price: true,
          status: true,
          type: true,
          categories: true,
          tokens: true,
          erc20tokens: true,
          views: true
        }
      })
      return order;
    } catch (err) {
      throw err;
    }
  }

}

module.exports = OrderService

