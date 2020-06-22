process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
let config = require('../config/config')

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()

let auth_token;

chai.use(chaiHttp);

let params = {
    name: "xyz",
    description: "testing",
    url: "test",
    address: [{ "chain_id": "1", "address": "0x0e3a2a1f2146d86a604adc220b4967a898d7fe07" }, { "chain_id": "2", "address": "0x4ef40d1bf0983899892946830abf99eca2dbc5ce" }]
}

describe('Category', async () => {

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

    let admin = {
        username: config.admin_username,
        password: config.admin_password,
    }
    chai.request(server)
        .post('/api/v1/admins/login')
        .send(admin)
        .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.auth_token.should.be.a('string')
            auth_token = res.body.auth_token
        });


    describe('/GET categories', () => {
        it('it should GET all the categories', (done) => {
            chai.request(server)
                .get('/api/v1/categories')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.categories.should.be.a('array');
                    res.body.data.categories.length.should.be.eql(0);
                    done();
                });
        });
    });

    describe('/POST create category', () => {
        it('it should create a category', (done) => {
            let category = {
                name: params.name,
                description: params.description,
                url: params.url,
                address: JSON.stringify(params.address)
            }
            chai.request(server)
                .post('/api/v1/categories/')
                .set('Authorization', auth_token)
                .type('form')
                .send(category)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.should.be.a('object');
                    done();
                });
        });

    });

    describe('/GET category', () => {
        it('it should GET single category', (done) => {

            let category = {
                name: params.name,
                description: params.description,
                url: params.url,
                address: JSON.stringify(params.address)
            }
            chai.request(server)
                .post('/api/v1/categories/')
                .set('Authorization', auth_token)
                .type('form')
                .send(category)
                .end((err, res) => {
                    let id = res.body.data.id
                    chai.request(server)
                        .get('/api/v1/categories/' + id)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.data.should.be.a('object');
                            done();
                        });
                });

        });
    });
});
