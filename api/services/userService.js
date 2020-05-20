const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/**
 * Includes all the User services that controls
 * the User Data object from the database
 */

class UserService {

  async createUser(params) {
    try {
      let user = await prisma.users.create({
        data: {
          address: params.address
        }
      })
      return user;
    } catch (err) {
      throw err;
    }
  }

  async getUsers() {
    try {
      let users = await prisma.users.findMany({
        where: {
          active: true
        }
      });
      return users;
    } catch (err) {
      throw err;
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
      throw err;
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
      throw err;
    }
  }

  async getUsersMakerOrders(params) {
    try {
      let orders = await prisma.users.findOne({
        where: {
          id: parseInt(params.userId)
        },
        select: { maker_orders: true }
      });
      return orders;
    } catch (err) {
      throw err;
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
      throw err;
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
      throw err;
    }
  }

  async getUsersFavorite(params) {
    try {
      let favorites = await prisma.users.findOne({
        where: {
          id: parseInt(params.userId)
        },
        select: { favorites: true }
      });
      return favorites;
    } catch (err) {
      throw err;
    }
  }

  async createUsersFavorite(params) {
    try {
      let favorites = await prisma.favorites.create({
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
      return favorites;
    } catch (err) {
      throw err;
    }
  }

  async userExists(params) {
    try {
      let users = await prisma.users.findOne({
        where: {
          address: params.address
        }
      });
      return users;
    } catch (err) {
      throw err;
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
      throw err;
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
      throw err;
    }
  }
}

module.exports = UserService

