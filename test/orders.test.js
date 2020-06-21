process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

let auth_token;
let admin_token;
let category_id;
let erc20Token_id;

chai.use(chaiHttp);

let initUser = () => {
    return new Promise((resolve, reject) => {
        let user = {
            address: "0xF962EEfD71d9cf4581E9004fa1EdEaA8f7d0aA12",
            signature: "0x33a436f974657480ea4b5e96e22d63231f93c863bcb558bef6b1d5657f2b9a9806532336b9a489c31d7ff1c5d2667b1a86490ad34ce7b127ea1690d0da3433b71b",
        }
        chai.request(server)
            .post('/api/v1/users/')
            .send(user)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                auth_token = res.body.auth_token
                resolve(auth_token)
            });
    })
}

let initAdmin = async () => {

    return new Promise((resolve, reject) => {
        let admin = {
            username: "admin",
            password: "Admin1234",
        }
        chai.request(server)
            .post('/api/v1/admins/login')
            .send(admin)
            .end((err, res) => {

                if (err) {
                    reject(err)
                }
                admin_token = res.body.auth_token
                resolve(admin_token)
            });
    })
}

let initCategory = async () => {

    return new Promise((resolve, reject) => {

        let category = {
            name: "xyz",
            description: "testing",
            url: "test",
            address: JSON.stringify([{ "chain_id": "1", "address": "0x0e3a2a1f2146d86a604adc220b4967a898d7fe07" }, { "chain_id": "2", "address": "0x4ef40d1bf0983899892946830abf99eca2dbc5ce" }])
        }
        chai.request(server)
            .post('/api/v1/categories/')
            .set('Authorization', admin_token)
            .type('form')
            .send(category)
            .end((err, res) => {

                if (err) {
                    reject(err)
                }

                category_id = res.body.data.id;
                resolve(category_id)
            });
    })

}

let initERC20Token = () => {

    return new Promise((resolve, reject) => {

        let erc20Token = {
            name: "xyz",
            symbol: "XY",
            decimal: "10",
            address: JSON.stringify([{ "chain_id": "1", "address": "0x0e3a2a1f2146d86a604adc220b4967a898d7fe07" }, { "chain_id": "2", "address": "0x4ef40d1bf0983899892946830abf99eca2dbc5ce" }])
        }
        chai.request(server)
            .post('/api/v1/erc20tokens/')
            .set('Authorization', admin_token)
            .type('form')
            .send(erc20Token)
            .end((err, res) => {
                if (err) {
                    reject(err)
                }
                erc20Token_id = res.body.data.id;
                resolve(erc20Token_id)
            });
    })

}


describe('Order', async () => {

    beforeEach((done) => { //Before each test we empty the database
        prisma.bids.deleteMany().then(() => {
            prisma.orders.deleteMany().then(() => {
                prisma.categoriesaddresses.deleteMany().then(() => {
                    prisma.categories.deleteMany().then(() => {
                        prisma.erc20tokensaddresses.deleteMany().then(() => {
                            prisma.erc20tokens.deleteMany().then(() => {
                                done();
                            })
                        })
                    })
                })
            })
        })
    });

    describe('/POST orders', () => {
        it('it should create new sell order', () => {

            return new Promise(async (resolve, reject) => {
                await initUser();
                await initAdmin();
                await initCategory();
                await initERC20Token();

                let order = {
                    maker_token_id: "0x4fc2FC9AC135978604273B3B8A730B1b48b86d14",
                    type: "NEGOTIATION",
                    signature: "0xa7b12275580a5352d2a09c28799c2a4cf8b1703a0a2e33fa134e115f06a25fdb7bf4eeeb1d972e40aed39e7f692aa8dddee8e49483ada4913ccfb6537f1cc56a1b",
                    taker_token: erc20Token_id,
                    price: "50",
                    min_price: "15",
                    expiry_date: "1590251406000",
                    chain_id: "1",
                    maker_token: category_id
                }
                chai.request(server)
                    .post('/api/v1/orders/')
                    .set('Authorization', auth_token)
                    .send(order)
                    .then((res) => {

                        let order_id = res.body.data.id
                        chai.request(server)
                            .get('/api/v1/orders/' + order_id)
                            .then((res) => {
                                res.should.have.status(200);
                                res.body.should.be.a('object');
                                resolve();
                            })
                    }).catch((err => {
                        reject(err)
                    }))
            });
        })
    });

    describe('/GET orders', () => {
        it('it should GET all the orders', (done) => {

            chai.request(server)
                .get('/api/v1/orders?categoryArray=[]')
                .end((err, res) => {

                    res.should.have.status(200);
                    res.body.data.order.should.be.a('array');
                    res.body.data.order.length.should.be.eql(0);
                    done();
                });
        });
    });

});


