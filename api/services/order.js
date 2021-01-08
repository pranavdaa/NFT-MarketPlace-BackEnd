const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
let { hasNextPage } = require("../utils/request-utils");
let constants = require("../../config/constants");
let zeroxUtil = require("../utils/zerox-util");

/**
 * Includes all the Order services that controls
 * the Order Data object from the database
 */

class OrderService {
  async placeFixedOrder(params) {
    try {
      let order = await prisma.orders.create({
        data: {
          seller_users: { connect: { id: parseInt(params.maker_address) } },
          categories: { connect: { id: parseInt(params.maker_token) } },
          maker_address: params.maker_address,
          tokens_id: params.maker_token_id,
          price: params.price,
          usd_price: params.usd_price,
          min_price: params.price,
          taker_amount: params.price,
          maker_amount: "1",
          signature: params.signature,
          erc20tokens: { connect: { id: parseInt(params.taker_token) } },
          type: params.type,
          chain_id: params.chain_id,
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async placeNegotiationOrder(params) {
    try {
      let order = await prisma.orders.create({
        data: {
          seller_users: { connect: { id: parseInt(params.taker_address) } },
          categories: { connect: { id: parseInt(params.taker_token) } },
          taker_address: params.taker_address,
          tokens_id: params.taker_token_id,
          min_price: params.min_price,
          price: params.price,
          usd_price: params.usd_price,
          taker_amount: "1",
          erc20tokens: { connect: { id: parseInt(params.maker_token) } },
          type: params.type,
          chain_id: params.chain_id,
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async placeAuctionOrder(params) {
    try {
      let order = await prisma.orders.create({
        data: {
          expiry_date: new Date(parseInt(params.expiry_date)),
          seller_users: { connect: { id: parseInt(params.taker_address) } },
          taker_address: params.taker_address,
          categories: { connect: { id: parseInt(params.taker_token) } },
          tokens_id: params.taker_token_id,
          min_price: params.min_price,
          taker_amount: "1",
          price: params.min_price,
          erc20tokens: { connect: { id: parseInt(params.maker_token) } },
          type: params.type,
          chain_id: params.chain_id,
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
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
          buyer: true,
          seller: true,
          id: true,
          created: true,
          min_price: true,
          usd_price: true,
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
                where: { chain_id: constants.MATIC_CHAIN_ID },
                select: { address: true, ethereum_address: true },
              },
            },
          },
          tokens_id: true,
          erc20tokens: {
            include: {
              erc20tokensaddresses: {
                where: { chain_id: constants.MATIC_CHAIN_ID },
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
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getOrderList() {
    try {
      let where = {
        AND: [{ active: true }, { status: 0 }],
      };

      let order = await prisma.orders.findMany({
        where,
        select: {
          id: true,
          usd_price: true,
          price: true,
          status: true,
          erc20tokens: {
            include: {
              erc20tokensaddresses: {
                where: { chain_id: constants.MATIC_CHAIN_ID },
                select: { address: true },
              },
            },
          },
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getAuctionOrders() {
    try {
      let order = await prisma.orders.findMany({
        where: {
          status: 0,
          active: true,
          type: "AUCTION",
        },
        select: { id: true, expiry_date: true },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
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
          buyer: true,
          seller: true,
          min_price: true,
          price: true,
          expiry_date: true,
          usd_price: true,
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
                where: { chain_id: constants.MATIC_CHAIN_ID },
                select: { address: true, ethereum_address: true },
              },
            },
          },
          tokens_id: true,
          erc20tokens: {
            include: {
              erc20tokensaddresses: {
                where: { chain_id: constants.MATIC_CHAIN_ID },
                select: { address: true },
              },
            },
          },
          seller_users: {
            select: {
              address: true,
            },
          },
          views: true,
          bids: { orderBy: { price: constants.SORT_DIRECTION.DESC } },
          updated: true,
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
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
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async checkValidOrder(params) {
    try {
      let order = await prisma.orders.findMany({
        where: {
          tokens_id: params.tokenId,
          seller: parseInt(params.userId),
          status: 0,
        },
      });

      if (order.length > 0) {
        return true;
      } else {
        return false;
      }
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async buyFixedOrder(params) {
    try {
      let txHash = await zeroxUtil.execute(
        JSON.parse(params.signature),
        JSON.parse(params.takerSign)
      );
      let order = await prisma.orders.update({
        where: { id: parseInt(params.orderId) },
        data: {
          buyer_users: { connect: { id: parseInt(params.taker_address) } },
          taker_address: params.taker_address,
          txhash: txHash,
          status: 2,
          updated: new Date(),
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
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
      let txHash = "";
      if (params.type === constants.ORDER_TYPES.FIXED) {
        txHash = await zeroxUtil.execute(
          JSON.parse(params.signature),
          JSON.parse(params.takerSign)
        );
      }
      let order = await prisma.orders.update({
        where: { id: parseInt(params.orderId) },
        data: {
          status: 3,
          signature: "",
          txhash: txHash,
          updated: new Date(),
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async expireOrder(params) {
    try {
      let order = await prisma.orders.update({
        where: { id: parseInt(params.orderId) },
        data: {
          status: 4,
          signature: "",
          updated: new Date(),
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async cancelBid(params) {
    let txHash = await zeroxUtil.execute(
      JSON.parse(params.signature),
      JSON.parse(params.takerSign)
    );
    const order = await prisma.bids.update({
      where: { id: parseInt(params.bidId) },
      data: {
        status: 3,
        signature: "",
      },
    });
    return order;
  }

  async clearBids(params) {
    const order = await prisma.bids.update({
      where: { id: parseInt(params.bidId) },
      data: {
        status: 3,
        signature: "",
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
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async executeOrder(params) {
    try {
      let txHash = await zeroxUtil.execute(
        JSON.parse(params.signature),
        JSON.parse(params.takerSign)
      );
      let order = await prisma.orders.update({
        where: { id: parseInt(params.orderId) },
        data: {
          buyer_users: { connect: { id: parseInt(params.maker_address) } },
          maker_address: params.maker_address,
          maker_amount: params.maker_amount,
          txhash: txHash,
          status: 2,
          updated: new Date(),
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
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
          status: 0,
        },
        orderBy: {
          price: constants.SORT_DIRECTION.DESC,
        },
        take: limit,
        skip: offset,
        include: {
          users: true,
          orders: {
            select: {
              erc20tokens: {
                select: {
                  erc20tokensaddresses: {
                    where: { chain_id: constants.MATIC_CHAIN_ID },
                  },
                },
              },
            },
          },
        },
      });
      return {
        order,
        limit,
        offset,
        has_next_page: hasNextPage({ limit, offset, count }),
      };
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = OrderService;
