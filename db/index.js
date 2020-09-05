const mysql = require('mysql')
const config = require('./config')
const log = require('../utils/log')
const { json } = require('body-parser')

function connect () {
  console.log(config)
  return mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.database,
    multipleStatements: true
  })
}

function querySql (sql) {
  const conn = connect()
  return new Promise((res, rej) => {
    try {
      conn.query(sql, (err, result) => {
        if (err) {
          log('查询失败， 原因：' + JSON.stringify(err))
          rej(err)
        } else {
          log('查询成功', JSON.stringify(result))
          res(result)
        }
      })
    } catch (e) {
      rej(e)
    } finally {
      conn.end()
    }
  })
}

module.exports = {
  querySql
}