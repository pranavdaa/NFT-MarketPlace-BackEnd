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
    address: config.address,
    signature: config.signature,
}

describe('User', async () => {

    beforeEach((done) => { //Before each test we empty the database
        prisma.bids.deleteMany().then(() => {
            prisma.orders.deleteMany().then(() => {
                prisma.categoriesaddresses.deleteMany().then(() => {
                    prisma.categories.deleteMany().then(() => {
                        prisma.erc20tokensaddresses.deleteMany().then(() => {
                            prisma.erc20tokens.deleteMany().then(() => {
                                prisma.users.deleteMany().then(() => {
                                    done();
                                })
                            })
                        })
                    })
                })
            })
        })
    });

    describe('/POST users', () => {
        it('it should create new user', (done) => {
            let user = params;
            chai.request(server)
                .post('/api/v1/users/')
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.auth_token.should.be.a('string')
                    auth_token = res.body.auth_token
                    done();
                });
        });
    });


    describe('/GET users', () => {
        it('it should GET all the users', (done) => {
            chai.request(server)
                .get('/api/v1/users')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.data.users.should.be.a('array');
                    res.body.data.users.length.should.be.eql(0);
                    done();
                });
        });
    });

    describe('/GET single user', () => {
        it('it should GET single user', (done) => {

            let user = params
            chai.request(server)
                .post('/api/v1/users/')
                .send(user)
                .end((err, res) => {

                    let id = res.body.data.id;
                    chai.request(server)
                        .get('/api/v1/users/' + id)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.data.should.be.a('object');
                            done();
                        });
                });
        });
    });

    describe('/GET sell orders', () => {
        it('it should GET sell orders', (done) => {

            let user = params
            chai.request(server)
                .post('/api/v1/users/')
                .send(user)
                .end((err, res) => {

                    let id = res.body.data.id;
                    chai.request(server)
                        .get('/api/v1/users/' + id + 'makerorders')
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.data.should.be.a('object');
                            done();
                        });
                });
        });
    });

    describe('/GET buy orders', () => {
        it('it should GET buy orders', (done) => {

            let user = params
            chai.request(server)
                .post('/api/v1/users/')
                .send(user)
                .end((err, res) => {

                    let id = res.body.data.id;
                    chai.request(server)
                        .get('/api/v1/users/' + id + 'takerorders')
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.data.should.be.a('object');
                            done();
                        });
                });
        });
    });

    describe('/GET bids', () => {
        it('it should GET users bids', (done) => {

            let user = params
            chai.request(server)
                .post('/api/v1/users/')
                .send(user)
                .end((err, res) => {

                    let id = res.body.data.id;
                    chai.request(server)
                        .get('/api/v1/users/' + id + 'bids')
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.data.should.be.a('object');
                            done();
                        });
                });
        });
    });

    describe('/GET favourites', () => {
        it('it should GET users favourite', (done) => {

            let user = params
            chai.request(server)
                .post('/api/v1/users/')
                .send(user)
                .end((err, res) => {

                    let id = res.body.data.id;
                    chai.request(server)
                        .get('/api/v1/users/' + id + 'favourites')
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.data.should.be.a('object');
                            done();
                        });
                });
        });
    });
});
