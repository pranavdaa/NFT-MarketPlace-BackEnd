require('dotenv').config()
const app = require('./app')

/**
 * Starting point of the application
 * configuration file is initialized 
 * and server is started.
 */
app.listen(process.env.PORT, () => {
    console.log('Server running on', process.env.PORT)
})
