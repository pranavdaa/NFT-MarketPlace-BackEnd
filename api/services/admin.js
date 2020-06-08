const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/**
 * Includes all the Admin services that controls
 * the Admin Data object from the database
 */

class AdminService {

    async createAdmin(params) {
        try {
            let admin = await prisma.admin.create({
                data: {
                    username: params.username,
                    password: params.password
                }
            })
            return admin;
        } catch (err) {
            console.log(err)
            throw new Error("Internal Server Error");
        }
    }

    async getAdmin(params) {
        try {
            let admin = await prisma.admin.findOne({
                where: {
                    username: params.username
                }
            });
            return admin;
        } catch (err) {
            console.log(err)
            throw new Error("Internal Server Error");
        }
    }
}

module.exports = AdminService

