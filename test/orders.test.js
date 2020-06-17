// process.env.NODE_ENV = 'test';

// let chai = require('chai');
// let chaiHttp = require('chai-http');
// let server = require('../server');
// let should = chai.should();

// const { PrismaClient } = require("@prisma/client")
// const prisma = new PrismaClient()

// let auth_token;

// chai.use(chaiHttp);

// describe('User', async () => {

//     beforeEach((done) => { //Before each test we empty the database
//         prisma.categoriesaddresses.deleteMany().then(() => {
//             prisma.users.deleteMany().then(() => {
//                 done();
//             })
//         })
//     });

//     describe('/POST users', () => {
//         it('it should create new user', (done) => {
//             let user = {
//                 address: "0xF962EEfD71d9cf4581E9004fa1EdEaA8f7d0aA12",
//                 signature: "0x33a436f974657480ea4b5e96e22d63231f93c863bcb558bef6b1d5657f2b9a9806532336b9a489c31d7ff1c5d2667b1a86490ad34ce7b127ea1690d0da3433b71b",
//             }
//             chai.request(server)
//                 .post('/api/v1/users/')
//                 .send(user)
//                 .end((err, res) => {
//                     res.should.have.status(200);
//                     res.body.should.be.a('object');
//                     res.body.auth_token.should.be.a('string')
//                     auth_token = res.body.auth_token
//                     done();
//                 });
//         });
//     });


//     describe('/GET users', () => {
//         it('it should GET all the users', (done) => {
//             chai.request(server)
//                 .get('/api/v1/users')
//                 .end((err, res) => {
//                     res.should.have.status(200);
//                     res.body.data.users.should.be.a('array');
//                     res.body.data.users.length.should.be.eql(0);
//                     done();
//                 });
//         });
//     });

//     describe('/GET single user', () => {
//         it('it should GET single user', (done) => {

//             let user = {
//                 address: "0xF962EEfD71d9cf4581E9004fa1EdEaA8f7d0aA12",
//                 signature: "0x33a436f974657480ea4b5e96e22d63231f93c863bcb558bef6b1d5657f2b9a9806532336b9a489c31d7ff1c5d2667b1a86490ad34ce7b127ea1690d0da3433b71b",
//             }
//             chai.request(server)
//                 .post('/api/v1/users/')
//                 .send(user)
//                 .end((err, res) => {

//                     let id = res.body.data.id;
//                     chai.request(server)
//                         .get('/api/v1/users/' + id)
//                         .end((err, res) => {
//                             res.should.have.status(200);
//                             res.body.data.should.be.a('object');
//                             done();
//                         });
//                 });
//         });
//     });

//     describe('/GET sell orders', () => {
//         it('it should GET sell orders', (done) => {

//             let user = {
//                 address: "0xF962EEfD71d9cf4581E9004fa1EdEaA8f7d0aA12",
//                 signature: "0x33a436f974657480ea4b5e96e22d63231f93c863bcb558bef6b1d5657f2b9a9806532336b9a489c31d7ff1c5d2667b1a86490ad34ce7b127ea1690d0da3433b71b",
//             }
//             chai.request(server)
//                 .post('/api/v1/users/')
//                 .send(user)
//                 .end((err, res) => {

//                     let id = res.body.data.id;
//                     chai.request(server)
//                         .get('/api/v1/users/' + id + 'makerorders')
//                         .end((err, res) => {
//                             res.should.have.status(200);
//                             res.body.data.should.be.a('object');
//                             done();
//                         });
//                 });
//         });
//     });

//     describe('/GET buy orders', () => {
//         it('it should GET buy orders', (done) => {

//             let user = {
//                 address: "0xF962EEfD71d9cf4581E9004fa1EdEaA8f7d0aA12",
//                 signature: "0x33a436f974657480ea4b5e96e22d63231f93c863bcb558bef6b1d5657f2b9a9806532336b9a489c31d7ff1c5d2667b1a86490ad34ce7b127ea1690d0da3433b71b",
//             }
//             chai.request(server)
//                 .post('/api/v1/users/')
//                 .send(user)
//                 .end((err, res) => {

//                     let id = res.body.data.id;
//                     chai.request(server)
//                         .get('/api/v1/users/' + id + 'takerorders')
//                         .end((err, res) => {
//                             res.should.have.status(200);
//                             res.body.data.should.be.a('object');
//                             done();
//                         });
//                 });
//         });
//     });

//     describe('/GET bids', () => {
//         it('it should GET users bids', (done) => {

//             let user = {
//                 address: "0xF962EEfD71d9cf4581E9004fa1EdEaA8f7d0aA12",
//                 signature: "0x33a436f974657480ea4b5e96e22d63231f93c863bcb558bef6b1d5657f2b9a9806532336b9a489c31d7ff1c5d2667b1a86490ad34ce7b127ea1690d0da3433b71b",
//             }
//             chai.request(server)
//                 .post('/api/v1/users/')
//                 .send(user)
//                 .end((err, res) => {

//                     let id = res.body.data.id;
//                     chai.request(server)
//                         .get('/api/v1/users/' + id + 'bids')
//                         .end((err, res) => {
//                             res.should.have.status(200);
//                             res.body.data.should.be.a('object');
//                             done();
//                         });
//                 });
//         });
//     });

//     describe('/GET favourites', () => {
//         it('it should GET users favourite', (done) => {

//             let user = {
//                 address: "0xF962EEfD71d9cf4581E9004fa1EdEaA8f7d0aA12",
//                 signature: "0x33a436f974657480ea4b5e96e22d63231f93c863bcb558bef6b1d5657f2b9a9806532336b9a489c31d7ff1c5d2667b1a86490ad34ce7b127ea1690d0da3433b71b",
//             }
//             chai.request(server)
//                 .post('/api/v1/users/')
//                 .send(user)
//                 .end((err, res) => {

//                     let id = res.body.data.id;
//                     chai.request(server)
//                         .get('/api/v1/users/' + id + 'favourites')
//                         .end((err, res) => {
//                             res.should.have.status(200);
//                             res.body.data.should.be.a('object');
//                             done();
//                         });
//                 });
//         });
//     });
// });
