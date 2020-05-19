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

            let users = await prisma.users.findMany();
            return users;
        } catch (err) {
            throw err;
        }
    }

    async userExists(params) {
        try {

            let users = await prisma.users.findOne({
                where: { address: params.address }
            });
            return users;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = UserService

