const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()
let { hasNextPage } = require('../utils/helper.js')

/**
 * Includes all the User services that controls
 * the User Data object from the database
 */

class UserService {

  async createUser(params) {
    try {
      let user = await prisma.users.create({
        data: {
          address: (params.address).toLowerCase()
        }
      })
      return user;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async getUsers({ limit, offset, orderBy }) {
    try {
      let where = {
        active: true
      }

      let count = await prisma.users.count({ where })
      let users = await prisma.users.findMany({
        where,
        orderBy,
        take: limit, skip: offset
      });

      return { users, limit, offset, has_next_page: hasNextPage({ limit, offset, count }) };
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async getUser(params) {
    try {
      let user = await prisma.users.findOne({
        where: {
          id: parseInt(params.userId)
        }
      });
      return user;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async getUsersTokens(params) {
    try {
      let tokens = await prisma.users.findOne({
        where: {
          id: parseInt(params.userId)
        },
        select: { tokens: true }
      });
      return tokens;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async getUsersMakerOrders(params) {
    try {
      let orders = await prisma.users.findMany({
        where: {
          id: parseInt(params.userId)
        },
        select: { maker_orders: true }
      });
      return orders;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async getUsersTakerOrders(params) {
    try {
      let orders = await prisma.users.findOne({
        where: {
          id: parseInt(params.userId)
        },
        select: { taker_orders: true }
      });
      return orders;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async getUsersBids(params) {
    try {
      let bids = await prisma.users.findMany({
        where: {
          id: parseInt(params.userId),
        },
        select: { bids: true }
      });
      return bids;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async getUsersFavourite(params) {
    try {
      let favourites = await prisma.users.findOne({
        where: {
          id: parseInt(params.userId)
        },
        select: { favourites: true }
      });
      return favourites;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async createUsersFavourite(params) {
    try {
      let favourites = await prisma.favourites.create({
        data: {
          users: {
            connect: {
              id: parseInt(params.userId)
            }
          },
          tokens: {
            connect: {
              id: parseInt(params.tokenId)
            }
          }
        }
      })
      return favourites;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async userExists(params) {
    try {
      let users = await prisma.users.findOne({
        where: {
          address: (params.address).toLowerCase()
        }
      });
      return users;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async activateUser(params) {
    try {
      let users = await prisma.users.update({
        where: {
          id: parseInt(params.userId)
        },
        data: {
          active: true
        }
      });
      return users;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }

  async deactivateUser(params) {
    try {
      let users = await prisma.users.update({
        where: {
          id: parseInt(params.userId)
        },
        data: {
          active: false
        }
      });
      return users;
    } catch (err) {
      console.log(err)
      throw new Error("Internal Server Error");
    }
  }
}

module.exports = UserService

