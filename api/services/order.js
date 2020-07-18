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
          price: params.price,
          min_price: params.price,
          taker_amount: params.price,
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
          maker_users: { connect: { id: parseInt(params.maker_address) } },
          categories: { connect: { id: parseInt(params.maker_token) } },
          tokens_id: params.maker_token_id,
          min_price: params.min_price,
          price: params.price,
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

  async placeAuctionOrder(params) {
    try {
      let order = await prisma.orders.create({
        data: {
          expiry_date: new Date(parseInt(params.expiry_date)),
          maker_users: { connect: { id: parseInt(params.maker_address) } },
          categories: { connect: { id: parseInt(params.maker_token) } },
          tokens_id: params.maker_token_id,
          min_price: params.min_price,
          price: params.min_price,
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
          id: true,
          created: true,
          min_price: true,
          price: true,
          expiry_date: true,
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
          erc20tokens: { select: { id: true } },
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
          id: true,
          created: true,
          min_price: true,
          price: true,
          expiry_date: true,
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
          erc20tokens: { select: { id: true } },
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
          status: 2,
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
              price: params.bid,
              users: { connect: { id: parseInt(params.taker_address) } },
            },
          ],
        },
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
          taker_users: { connect: { id: parseInt(params.taker_address) } },
          taker_amount: params.taker_amount,
          status: 2,
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
