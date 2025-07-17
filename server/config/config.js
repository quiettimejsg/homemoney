const path = require('path')
const result = require('dotenv').config({ path: path.resolve(__dirname, '../.env') })
if (result.error) {
  throw new Error(`Failed to load .env file: ${result.error.message}`)
}

module.exports = {
  development: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
    jwtSecret: process.env.JWT_SECRET
  },
  test: {
    dialect: 'sqlite',
    storage: ':memory:',
    logging: false,
    jwtSecret: process.env.JWT_SECRET
  },
  production: {
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false,
    jwtSecret: process.env.JWT_SECRET
  }
}
