//the index.js file only imports the actual application from app.js and then starts the application

//rn, express is a function that is used to create the application that is stored in the app variable
const app = require('./app')

//imports Node's built-in web server module (CommonJS module; functions similarly to ES6 modules)
//code that runs in the browser uses ES6 modules
const http = require('http')

const config = require('./utils/config')
const logger = require('./utils/logger')

const server = http.createServer(app)

server.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`)
})
