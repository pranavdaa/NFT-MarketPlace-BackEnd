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

  async getUser(params) {
    try {
      let user = await prisma.users.findOne({
        where: {
          id: parseInt(params.userId),
          active: true
        }
      });
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

  async getUsersTokens(params) {
    try {
      let tokens = await prisma.tokens.findMany({
        where: {
          owner: parseInt(params.userId),
          active: true
        },
        include: { categories: true }
      });
      return tokens;
    } catch (err) {
      throw err;
    }
  }

  async getUsersBids(params) {
    try {
      let bids = await prisma.bids.findMany({
        where: {
          users: parseInt(params.userId),
          active: true
        },
        include: { orders_bids: true }
      });
      return bids;
    } catch (err) {
      throw err;
    }
  }

  async getUsersFavorite(params) {
    try {
      let favorites = await prisma.favorites.findMany({
        where: {
          users: parseInt(params.userId)
        },
        include: { tokens: true }
      });
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

