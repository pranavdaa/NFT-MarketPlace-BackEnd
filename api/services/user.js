const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
let { hasNextPage } = require("../utils/helper.js");
let constants = require("../../config/constants");

/**
 * Includes all the User services that controls
 * the User Data object from the database
 */

class UserService {
  async createUser(params) {
    try {
      let user = await prisma.users.create({
        data: {
          address: params.address.toLowerCase(),
        },
      });
      return user;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUsers({ limit, offset, orderBy }) {
    try {
      let where = {
        active: true,
      };

      let count = await prisma.users.count({ where });
      let users = await prisma.users.findMany({
        where,
        orderBy,
        take: limit,
        skip: offset,
      });

      return {
        users,
        limit,
        offset,
        has_next_page: hasNextPage({ limit, offset, count }),
      };
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUser(params) {
    try {
      let user = await prisma.users.findOne({
        where: {
          id: parseInt(params.userId),
        },
      });
      return user;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUsersMakerOrders({ userId, limit, offset, orderBy }) {
    try {
      let count = await prisma.orders.count({
        where: { AND: [{ seller: parseInt(userId) }, { active: true }] },
      });
      let orders = await prisma.users.findMany({
        where: {
          id: parseInt(userId),
        },
        select: {
          seller_orders: {
            where: {
              active: true,
            },
            orderBy,
            take: limit,
            skip: offset,
          },
        },
      });

      return {
        orders,
        limit,
        offset,
        has_next_page: hasNextPage({ limit, offset, count }),
      };
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUsersActiveOrders({ userId, limit, offset, orderBy }) {
    try {
      let count = await prisma.orders.count({
        where: {
          AND: [{ seller: parseInt(userId) }, { active: true }, { status: 0 }],
        },
      });
      let orders = await prisma.users.findMany({
        where: {
          id: parseInt(userId),
        },
        select: {
          seller_orders: {
            where: {
              active: true,
              status: 0,
            },
            orderBy,
            take: limit,
            skip: offset,
          },
        },
      });

      return {
        orders,
        limit,
        offset,
        has_next_page: hasNextPage({ limit, offset, count }),
      };
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUsersTakerOrders({ userId, limit, offset, orderBy }) {
    try {
      let count = await prisma.orders.count({
        where: { AND: [{ buyer: parseInt(userId) }, { active: true }] },
      });
      let orders = await prisma.users.findMany({
        where: {
          id: parseInt(userId),
        },
        select: {
          buyer_orders: {
            where: {
              active: true,
            },
            orderBy,
            take: limit,
            skip: offset,
          },
        },
      });

      return {
        orders,
        limit,
        offset,
        has_next_page: hasNextPage({ limit, offset, count }),
      };
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUsersBids({ userId, limit, offset, orderBy }) {
    try {
      let count = await prisma.bids.count({
        where: { AND: [{ users_id: parseInt(userId) }, { active: true }] },
      });
      let bids = await prisma.users.findMany({
        where: {
          id: parseInt(userId),
        },
        select: {
          bids: {
            where: {
              active: true,
            },
            orderBy,
            take: limit,
            skip: offset,
          },
        },
      });

      return {
        bids,
        limit,
        offset,
        has_next_page: hasNextPage({ limit, offset, count }),
      };
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUsersFavourite({ userId, limit, offset, orderBy }) {
    try {
      let count = await prisma.favourites.count({
        where: { AND: [{ users_id: parseInt(userId) }] },
      });
      let favourites = await prisma.users.findMany({
        where: {
          id: parseInt(userId),
        },
        select: {
          favourites: {
            orderBy,
            take: limit,
            skip: offset,
            include: { orders: true },
          },
        },
      });

      return {
        favourites: favourites[0].favourites,
        limit,
        offset,
        has_next_page: hasNextPage({ limit, offset, count }),
      };
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async createUsersFavourite(params) {
    try {
      let favourites = await prisma.favourites.create({
        data: {
          users: {
            connect: {
              id: parseInt(params.userId),
            },
          },
          orders: {
            connect: {
              id: parseInt(params.orderId),
            },
          },
          updated: new Date(),
        },
      });
      return favourites;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteUsersFavourite(params) {
    try {
      let favourite = await prisma.favourites.delete({
        where: { id: parseInt(params.favouriteId) },
      });
      return favourite;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getFavourite(params) {
    try {
      let favourite = await prisma.favourites.findOne({
        where: {
          id: parseInt(params.favouriteId),
        },
      });
      return favourite;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async favouriteExists(params) {
    try {
      let favourite = await prisma.favourites.findMany({
        where: {
          AND: [
            { users_id: parseInt(params.userId) },
            { order_id: parseInt(params.orderId) },
          ],
        },
      });
      return favourite;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async userExists(params) {
    try {
      let users = await prisma.users.findOne({
        where: {
          address: params.address.toLowerCase(),
        },
      });
      return users;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getUserNotification({ userId, limit, offset, orderBy }) {
    try {
      let count = await prisma.notifications.count({
        where: {
          usersId: parseInt(userId),
        },
      });
      let notifications = await prisma.notifications.findMany({
        where: {
          usersId: parseInt(userId),
        },
        orderBy,
        take: limit,
        skip: offset,
      });

      return {
        notifications,
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

module.exports = UserService;
