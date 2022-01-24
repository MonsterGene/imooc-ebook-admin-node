const config = require(`../../ebook_${process.env.NODE_ENV}_config.js`)
host = config.dbHost
user = config.dbUser
password = config.dbPassword
database = config.database

module.exports = {
  host: config.dbHost,
  user: config.dbUser,
  password: config.dbPassword,
  database: config.database,
}