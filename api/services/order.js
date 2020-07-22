const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
let { hasNextPage } = require("../utils/helper.js");

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
          tokens_id: params.maker_token_id,
          price: parseFloat(params.price),
          min_price: parseFloat(params.price),
          taker_amount: parseFloat(params.price),
          maker_amount: 1,
          signature: params.signature,
          erc20tokens: { connect: { id: parseInt(params.taker_token) } },
          type: params.type,
          chain_id: params.chain_id,
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }

  async placeNegotiationOrder(params) {
    try {
      let order = await prisma.orders.create({
        data: {
          taker_users: { connect: { id: parseInt(params.taker_address) } },
          categories: { connect: { id: parseInt(params.taker_token) } },
          tokens_id: params.taker_token_id,
          min_price: parseFloat(params.min_price),
          price: parseFloat(params.price),
          taker_amount: 1,
          erc20tokens: { connect: { id: parseInt(params.maker_token) } },
          type: params.type,
          chain_id: params.chain_id,
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }

  async placeAuctionOrder(params) {
    try {
      let order = await prisma.orders.create({
        data: {
          expiry_date: new Date(parseInt(params.expiry_date)),
          taker_users: { connect: { id: parseInt(params.taker_address) } },
          categories: { connect: { id: parseInt(params.taker_token) } },
          tokens_id: params.taker_token_id,
          min_price: parseFloat(params.min_price),
          taker_amount: 1,
          price: parseFloat(params.min_price),
          erc20tokens: { connect: { id: parseInt(params.maker_token) } },
          type: params.type,
          chain_id: params.chain_id,
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }

  async getOrders({ categoryArray, limit, offset, orderBy }) {
    try {
      let where;
      if (JSON.parse(categoryArray).length !== 0) {
        where = {
          AND: [
            { active: true },
            { status: 0 },
            { categories_id: { in: JSON.parse(categoryArray) } },
          ],
        };
      } else {
        where = {
          AND: [{ active: true }, { status: 0 }],
        };
      }

      let count = await prisma.orders.count({ where });
      let order = await prisma.orders.findMany({
        where,
        select: {
          maker_address: true,
          id: true,
          created: true,
          min_price: true,
          price: true,
          expiry_date: true,
          txhash: true,
          taker_address: true,
          taker_amount: true,
          maker_amount: true,
          status: true,
          type: true,
          categories: {
            include: {
              categoriesaddresses: {
                where: { chain_id: "80001" },
                select: { address: true },
              },
            },
          },
          tokens_id: true,
          erc20tokens: {
            include: {
              erc20tokensaddresses: {
                where: { chain_id: "80001" },
                select: { address: true },
              },
            },
          },
          views: true,
          bids: true,
          updated: true,
        },
        orderBy,
        take: limit,
        skip: offset,
      });
      return {
        order,
        limit,
        offset,
        has_next_page: hasNextPage({ limit, offset, count }),
      };
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }

  async getOrder(params) {
    try {
      let order = await prisma.orders.findOne({
        where: {
          id: parseInt(params.orderId),
        },
        select: {
          maker_address: true,
          id: true,
          created: true,
          min_price: true,
          price: true,
          expiry_date: true,
          txhash: true,
          taker_address: true,
          signature: true,
          taker_amount: true,
          maker_amount: true,
          status: true,
          type: true,
          categories: {
            include: {
              categoriesaddresses: {
                where: { chain_id: "80001" },
                select: { address: true },
              },
            },
          },
          tokens_id: true,
          erc20tokens: {
            include: {
              erc20tokensaddresses: {
                where: { chain_id: "80001" },
                select: { address: true },
              },
            },
          },
          views: true,
          bids: true,
          updated: true,
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }

  async orderExists(params) {
    try {
      let order = await prisma.orders.findOne({
        where: {
          id: parseInt(params.orderId),
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }

  async buyFixedOrder(params) {
    try {
      let order = await prisma.orders.update({
        where: { id: parseInt(params.orderId) },
        data: {
          taker_users: { connect: { id: parseInt(params.taker_address) } },
          txhash: params.tx_hash,
          status: 2,
          updated: new Date(),
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }

  async makeBid(params) {
    const order = await prisma.orders.update({
      where: { id: parseInt(params.orderId) },
      data: {
        bids: {
          create: [
            {
              price: parseFloat(params.bid),
              signature: params.signature,
              users: { connect: { id: parseInt(params.maker_address) } },
            },
          ],
        },
        updated: new Date(),
      },
    });
    return order;
  }

  async cancelOrder(params) {
    try {
      let order = await prisma.orders.update({
        where: { id: parseInt(params.orderId) },
        data: {
          status: 3,
        },
        updated: new Date(),
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }

  async cancelBid(params) {
    const order = await prisma.bids.update({
      where: { id: parseInt(params.bidId) },
      data: {
        status: 3,
      },
    });
    return order;
  }

  async bidExists(params) {
    try {
      let bid = await prisma.bids.findOne({
        where: {
          id: parseInt(params.bidId),
        },
      });
      return bid;
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }

  async executeOrder(params) {
    try {
      let order = await prisma.orders.update({
        where: { id: parseInt(params.orderId) },
        data: {
          maker_users: { connect: { id: parseInt(params.maker_address) } },
          maker_amount: params.maker_amount,
          txhash: params.tx_hash,
          status: 2,
          updated: new Date(),
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }

  async getBids({ orderId, limit, offset, orderBy }) {
    try {
      let where = {
        AND: [{ active: true }, { status: 0 }],
      };

      let count = await prisma.bids.count({ where });
      let order = await prisma.bids.findMany({
        where: {
          orders_id: parseInt(orderId),
        },
        orderBy,
        take: limit,
        skip: offset,
        include: { users: true },
      });
      return {
        order,
        limit,
        offset,
        has_next_page: hasNextPage({ limit, offset, count }),
      };
    } catch (err) {
      console.log(err);
      throw new Error("Internal Server Error");
    }
  }
}

module.exports = OrderService;
