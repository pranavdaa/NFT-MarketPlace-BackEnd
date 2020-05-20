const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

/**
 * Includes all the Order services that controls
 * the Order Data object from the database
 */

class OrderService {

    async placeOrder(params) {

        try {
            let order = await prisma.orders.create({
                data: {
                    expiry_date: params.expiry,
                    maker_addressTousers: { connect: { id: parseInt(params.maker_address) } },
                    tokens: { connect: { id: parseInt(params.maker_token) } },
                    categories: { connect: { id: parseInt(params.maker_amount) } },
                    min_price: params.min_price,
                    price: params.price,
                    signature: params.signature,
                    erc20tokens: { connect: { id: parseInt(params.taker_token) } },
                    type: params.type,
                }
            })
            return order;
        } catch (err) {
            throw err;
        }
    }

    // async getOrders() {
    //     try {

    //         let orders = await prisma.orders.findMany();
    //         return orders;
    //     } catch (err) {
    //         throw err;
    //     }
    // }

    // async getOrder(params) {
    //     try {

    //         let order = await prisma.orders.findOne({
    //             where: { id: parseInt(params.id) }
    //         });
    //         return order;
    //     } catch (err) {
    //         throw err;
    //     }
    // }

}

module.exports = OrderService

