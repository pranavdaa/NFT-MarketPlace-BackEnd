let path = require('path')
let dotenv = require('dotenv')

// load config env
let root = path.normalize(`${__dirname}/..`)
let fileName = '';

switch (process.env.NODE_ENV) {
    case 'production': {
        fileName = '/config-production.env'
        break;
    }
    case 'test': {
        fileName = '/config-test.env'
        break;
    }
    default: fileName = '/.env'
}

const configFile = `${root}${fileName}`
dotenv.config({ path: configFile, silent: true })

module.exports = {
    secret: process.env.jwt_secret,
    port: process.env.PORT,
    admin_username: process.env.admin_username,
    admin_password: process.env.admin_password,
    NODE_ENV: process.env.NODE_ENV
}