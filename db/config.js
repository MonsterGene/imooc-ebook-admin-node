const { env } = require('../utils/env')

let host, user, password, database

if (env === 'dev') {
  host = 'localhost'
  user = 'root'
  password = 'root'
  database = 'ebook'
} else if (env === 'prod') {
  const prodConf = require('../../ebook_production_config.js')
  host = prodConf.dbHost
  user = prodConf.dbUser
  password = prodConf.dbPassword
  database = prodConf.database
}

module.exports = {
  host,
  user,
  password,
  database,
}