const prisma = require("../../prisma")
let constants = require("../../config/constants");

/**
 * Includes all the Admin services that controls
 * the Admin Data object from the database
 */

class AdminService {
  async createAdmin(params) {
    try {
      let { username, password } = params;
      let admin = await prisma.admins.create({
        data: {
          username: username,
          password: password,
        },
      });
      return admin;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }

  async getAdmin(params) {
    try {
      let { username } = params;
      let admin = await prisma.admins.findOne({
        where: {
          username: username,
        },
      });
      return admin;
    } catch (err) {
      console.log(err);
      throw new Error(constants.MESSAGES.INTERNAL_SERVER_ERROR);
    }
  }
}

module.exports = AdminService;
