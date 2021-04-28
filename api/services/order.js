const prisma = require("../../prisma");
let { hasNextPage } = require("../utils/request-utils");
let constants = require("../../config/constants");
let zeroxUtil = require("../utils/zerox-util");
const helper = require("../utils/helper");
let { ContractWrappers, OrderStatus } = require("@0x/contract-wrappers");

/**
 * Includes all the Order services that controls
 * the Order Data object from the database
 */

class OrderService {
  async placeFixedOrder(params) {
    try {
      let { maker_address, maker_token, maker_token_id, usd_price, price, token_type, price_per_unit, quantity, signature, taker_token, type, chain_id } = params;
      let order = await prisma.orders.create({
        data: {
          seller_users: { connect: { id: parseInt(maker_address) } },
          categories: { connect: { id: parseInt(maker_token) } },
          maker_address: maker_address,
          tokens: {
            connect: {
              token_id_categories_id: {
                token_id: maker_token_id,
                categories_id: parseInt(maker_token),
              },
            },
          },
          price: params.price,
          usd_price: parseFloat(usd_price),
          min_price: price,
          token_type: token_type,
          price_per_unit: price_per_unit,
          min_price_per_unit: price_per_unit,
          quantity: quantity,
          taker_amount: price,
          maker_amount: "1",
          signature: signature,
          erc20tokens: { connect: { id: parseInt(taker_token) } },
          type: type,
          chain_id: chain_id,
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
      let { taker_address, taker_token, taker_token_id, min_price, price, token_type, price_per_unit, min_price_per_unit, quantity, usd_price, maker_token, type, chain_id } = params
      let order = await prisma.orders.create({
        data: {
          seller_users: { connect: { id: parseInt(taker_address) } },
          categories: { connect: { id: parseInt(taker_token) } },
          taker_address: taker_address,
          tokens: {
            connect: {
              token_id_categories_id: {
                token_id: taker_token_id,
                categories_id: parseInt(taker_token),
              },
            },
          },
          min_price: min_price,
          price: price,
          token_type: token_type,
          price_per_unit: price_per_unit,
          min_price_per_unit: min_price_per_unit,
          quantity: quantity,
          usd_price: parseFloat(usd_price),
          taker_amount: "1",
          erc20tokens: { connect: { id: parseInt(maker_token) } },
          type: type,
          chain_id: chain_id,
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
      let { expiry_date, taker_address, taker_token, maker_token, min_price, chain_id, taker_token_id } = params
      let order = await prisma.orders.create({
        data: {
          expiry_date: new Date(parseInt(expiry_date)),
          seller_users: { connect: { id: parseInt(taker_address) } },
          taker_address: taker_address,
          categories: { connect: { id: parseInt(taker_token) } },
          tokens_id: taker_token_id,
          min_price: min_price,
          taker_amount: "1",
          price: min_price,
          erc20tokens: { connect: { id: parseInt(maker_token) } },
          type: type,
          chain_id: chain_id,
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getOrders({ categoryArray, limit, offset, orderBy, searchString }) {
    try {
      let where;
      if (categoryArray && JSON.parse(categoryArray).length !== 0) {
        where = {
          AND: [
            { active: true },
            { status: 0 },
            { categories_id: { in: JSON.parse(categoryArray) } },
            { tokens: { name_lowercase: { contains: searchString } } },
          ],
        };
      } else {
        where = {
          AND: [
            { active: true },
            { status: 0 },
            { tokens: { name_lowercase: { contains: searchString } } },
          ],
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
          price_per_unit: true,
          min_price_per_unit: true,
          quantity: true,
          token_type: true,
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
          tokens: true,
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
          price: true,
          erc20tokens: {
            select: {
              symbol: true,
            },
          },
          categories: {
            include: {
              categoriesaddresses: {
                where: { chain_id: constants.MATIC_CHAIN_ID },
                select: { address: true, ethereum_address: true },
              },
            },
          },
          tokens_id: true,
        },
      });
      return order;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getFullOrderList() {
    try {
      let where = {
        AND: [{ active: true }, { status: 0 }],
      };

      let order = await prisma.orders.findMany({
        where,
        select: {
          id: true,
          price: true,
          erc20tokens: {
            select: {
              symbol: true,
            },
          },
          categories: {
            include: {
              categoriesaddresses: {
                where: { chain_id: constants.MATIC_CHAIN_ID },
                select: { address: true, ethereum_address: true },
              },
            },
          },
          tokens_id: true,
        },
        orderBy: { id: constants.SORT_DIRECTION.DESC },
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
      let { orderId } = params
      let order = await prisma.orders.findOne({
        where: {
          id: parseInt(orderId),
        },
        select: {
          maker_address: true,
          id: true,
          created: true,
          buyer: true,
          seller: true,
          min_price: true,
          price: true,
          price_per_unit: true,
          min_price_per_unit: true,
          quantity: true,
          token_type: true,
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
          tokens: true,
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
      let { orderId } = params
      let order = await prisma.orders.findOne({
        where: {
          id: parseInt(orderId),
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
      let { tokenId, categoriesId, userId } = params;
      let order = await prisma.orders.findMany({
        where: {
          tokens_id: tokenId,
          categories_id: categoriesId,
          seller: parseInt(userId),
          status: 0,
        },
      });

      if (order.length > 0) {
        return { order_id: order[0].id, active_order: true };
      } else {
        return { order_id: null, active_order: false };
      }
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async buyFixedOrder(params) {
    try {
      let { signature, takerSign, orderId, taker_address } = params;
      let txHash = await zeroxUtil.execute(
        JSON.parse(signature),
        JSON.parse(takerSign)
      );
      let order = await prisma.orders.update({
        where: { id: parseInt(orderId) },
        data: {
          buyer_users: { connect: { id: parseInt(taker_address) } },
          taker_address: taker_address,
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

  async swapToken(params) {
    try {
      let { signedOrder } = params;
      let tx = await zeroxUtil.executeSwap(signedOrder);
      return tx;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async updateOrderPrice(params) {
    try {
      let { orderId, usdPrice } = params;
      let order = await prisma.orders.update({
        where: { id: parseInt(orderId) },
        data: {
          usd_price: usdPrice,
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
      let { orderId, signature, takerSign } = params;
      if (params.type === constants.ORDER_TYPES.FIXED) {
        txHash = await zeroxUtil.execute(
          JSON.parse(signature),
          JSON.parse(takerSign)
        );
      }
      let order = await prisma.orders.update({
        where: { id: parseInt(orderId) },
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
      let { orderId } = params;
      let order = await prisma.orders.update({
        where: { id: parseInt(orderId) },
        data: {
          status: 3,
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
    let { signature, takerSign, bidId } = params;
    let txHash = await zeroxUtil.execute(
      JSON.parse(signature),
      JSON.parse(takerSign)
    );
    const order = await prisma.bids.update({
      where: { id: parseInt(bidId) },
      data: {
        status: 3,
        signature: "",
      },
    });
    return order;
  }

  async clearBids(params) {
    let { bidId } = params
    const order = await prisma.bids.update({
      where: { id: parseInt(bidId) },
      data: {
        status: 3,
        signature: "",
      },
    });
    return order;
  }

  async bidExists(params) {
    try {
      let { bidId } = params;
      let bid = await prisma.bids.findOne({
        where: {
          id: parseInt(bidId),
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
      let { maker_address, maker_amount } = params;
      let txHash = await zeroxUtil.execute(
        JSON.parse(params.signature),
        JSON.parse(params.takerSign)
      );
      let order = await prisma.orders.update({
        where: { id: parseInt(params.orderId) },
        data: {
          buyer_users: { connect: { id: parseInt(params.maker_address) } },
          maker_address: maker_address,
          maker_amount: maker_amount,
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

      // let bids = await prisma.bids.findMany({
      //   where: {
      //     orders_id: parseInt(orderId),
      //     status: 0,
      //   },
      //   include: {
      //     users: true,
      //     orders: {
      //       select: {
      //         erc20tokens: {
      //           select: {
      //             erc20tokensaddresses: {
      //               where: { chain_id: constants.MATIC_CHAIN_ID },
      //             },
      //           },
      //         },
      //       },
      //     },
      //   },
      // });
      // // here
      // for (const data of bids) {
      //   let orderInvalid = false;
      //   if (data.signature) {
      //     let signedOrder = JSON.parse(data.signature);
      //     const contractWrappers = new ContractWrappers(
      //       helper.providerEngine(),
      //       {
      //         chainId: parseInt(constants.MATIC_CHAIN_ID),
      //       }
      //     );

      //     const [
      //       { orderStatus, orderHash },
      //       remainingFillableAmount,
      //       isValidSignature,
      //     ] = await contractWrappers.devUtils
      //       .getOrderRelevantState(signedOrder, signedOrder.signature)
      //       .callAsync();

      //     orderInvalid = !(
      //       orderStatus === OrderStatus.Fillable &&
      //       remainingFillableAmount.isGreaterThan(0) &&
      //       isValidSignature
      //     );

      //     if (
      //       !(await helper.checkTokenBalance(
      //         signedOrder.makerAddress,
      //         signedOrder.makerAssetAmount,
      //         data.orders.erc20tokens.erc20tokensaddresses[0].address
      //       )) ||
      //       orderInvalid
      //     ) {
      //       await this.clearBids({ bidId: data.id });
      //     }
      //   }
      // }
      //here

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
