const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/**
 * Includes all the Category services that controls
 * the Category Data object from the database
 */

class CategoryService {

    async createCategory(params, path) {

        try {
            let category = await prisma.categories.create({
                data: {
                    name: params.name,
                    description: params.description,
                    url: params.url,
                    img_url: path,
                    categoryaddresses: {
                        create: [{
                            address: params.matic_address, chain_id: "0"
                        }, {
                            address: params.ethereum_address, chain_id: "1"
                        }]
                    }
                }
            })
            return category;
        } catch (err) {
            throw err;
        }
    }

    async getCategories() {
        try {

            let categories = await prisma.categories.findMany({
                include: { categoryaddresses: true }
            });
            return categories;
        } catch (err) {
            throw err;
        }
    }

    async categoryExists(params) {
        try {

            let categories = await prisma.categories.findOne({
                where: { name: params.name }
            });
            return categories;
        } catch (err) {
            throw err;
        }
    }

    async getCategory(params) {
        try {

            let categories = await prisma.categories.findOne({
                where: { id: parseInt(params.id) }
            });
            return categories;
        } catch (err) {
            throw err;
        }
    }

    async getTokensFromCategory(params) {
        try {

            let tokens = await prisma.categories.findOne({
                select: { tokens: true },
                where: { id: parseInt(params.id) },
            });
            return tokens;
        } catch (err) {
            throw err;
        }
    }
}

module.exports = CategoryService

