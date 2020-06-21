process.env.NODE_ENV = 'test';

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

let auth_token;

chai.use(chaiHttp);

describe('ERC20 Token', async () => {

    beforeEach((done) => { //Before each test we empty the database
        prisma.erc20tokensaddresses.deleteMany().then(() => {
            prisma.erc20tokens.deleteMany().then(() => {
                done();
            })
        })
    });

    let admin = {
        username: "admin",
        password: "Admin1234",
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

    describe('/GET erc20tokens', () => {
        it('it should GET all the erc20 tokens', (done) => {
            chai.request(server)
                .get('/api/v1/erc20tokens')
                .end((err, res) => {

                    res.should.have.status(200);
                    res.body.data.erc20Tokens.should.be.a('array');
                    res.body.data.erc20Tokens.length.should.be.eql(0);
                    done();
                });
        });
    });

    describe('/POST create erc20token', () => {
        it('it should create a erc20token', (done) => {
            let category = {
                name: "xyz",
                symbol: "XY",
                decimal: "10",
                address: JSON.stringify([{ "chain_id": "1", "address": "0x0e3a2a1f2146d86a604adc220b4967a898d7fe07" }, { "chain_id": "2", "address": "0x4ef40d1bf0983899892946830abf99eca2dbc5ce" }])
            }
            chai.request(server)
                .post('/api/v1/erc20tokens/')
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

    describe('/GET erc20token', () => {
        it('it should GET single erc20token', (done) => {

            let category = {
                name: "xyz",
                symbol: "XY",
                decimal: "10",
                address: JSON.stringify([{ "chain_id": "1", "address": "0x0e3a2a1f2146d86a604adc220b4967a898d7fe07" }, { "chain_id": "2", "address": "0x4ef40d1bf0983899892946830abf99eca2dbc5ce" }])
            }
            chai.request(server)
                .post('/api/v1/erc20tokens/')
                .set('Authorization', auth_token)
                .type('form')
                .send(category)
                .end((err, res) => {
                    let id = res.body.data.id
                    chai.request(server)
                        .get('/api/v1/erc20tokens/' + id)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.data.should.be.a('object');
                            done();
                        });
                });

        });
    });
});
