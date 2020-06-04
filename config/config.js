import path from 'path'
import dotenv from 'dotenv'

// load config env
let root = path.normalize(`${__dirname}/../..`)
const fileName =
    process.env.NODE_ENV === 'production'
        ? '/config-production.env'
        : '/.env'
const configFile = `${root}${fileName}`

dotenv.config({ path: configFile, silent: true })

const secret = process.env.jwt_secret;

export default {
    secret: secret,
}
