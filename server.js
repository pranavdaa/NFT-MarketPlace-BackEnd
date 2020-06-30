import config from './config/config'
require('./api/utils/admin-seed')
const app = require('./app')

/**
 * Starting point of the application
 * configuration file is initialized 
 * and server is started.
 */
app.listen(config.port, () => {
    console.log('Server running on', config.port)
})
