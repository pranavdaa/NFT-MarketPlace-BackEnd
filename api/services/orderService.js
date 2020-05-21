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
          taker_amount: params.price,
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
          views: true,
          bids: true
        }
      })
      return order;
    } catch (err) {
      throw err;
    }
  }

  async getOrder(params) {
    try {
      let order = await prisma.orders.findOne({
        where: {
          id: parseInt(params.id)
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
          views: true,
          bids: true
        }
      })
      return order;
    } catch (err) {
      throw err;
    }
  }

  async orderExists(params) {
    try {
      let order = await prisma.orders.findOne({
        where: {
          id: parseInt(params.id)
        }
      })
      return order;
    } catch (err) {
      throw err;
    }
  }

  async buyFixedOrder(params, body) {
    try {

      let order = await prisma.orders.update({
        where: { id: parseInt(params.id) },
        data: {
          taker_users: { connect: { id: parseInt(body.taker_address) } },
          status: 2
        },
      })
      return order;
    } catch (err) {
      throw err;
    }
  }

  async makeBid(params, body) {
    const order = await prisma.orders.update({
      where: { id: parseInt(params.id) },
      data: {
        bids: {
          create: [{
            price: body.bid,
            users: { connect: { id: parseInt(body.taker_address) } },
          }],
        },
      },
    })
    return order;
  }

  async cancelOrder(params) {
    try {

      let order = await prisma.orders.update({
        where: { id: parseInt(params.id) },
        data: {
          status: 3
        },
      })
      return order;
    } catch (err) {
      throw err;
    }
  }

  async cancelBid(params) {
    const order = await prisma.bids.update({
      where: { id: parseInt(params.id) },
      data: {
        status: 3
      },
    })
    return order;
  }

  async bidExists(params) {
    try {
      let bid = await prisma.bids.findOne({
        where: {
          id: parseInt(params.id)
        }
      })
      return bid;
    } catch (err) {
      throw err;
    }
  }

  async executeOrder(params, body) {
    try {

      let order = await prisma.orders.update({
        where: { id: parseInt(params.id) },
        data: {
          taker_users: { connect: { id: parseInt(body.taker_address) } },
          taker_amount: body.taker_amount,
          status: 2
        },
      })
      return order;
    } catch (err) {
      throw err;
    }
  }

}

module.exports = OrderService

