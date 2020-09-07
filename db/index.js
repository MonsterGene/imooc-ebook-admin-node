const mysql = require('mysql')
const config = require('./config')
const log = require('../utils/log')

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

function queryOne(sql) {
  return new Promise((resolve, reject) => {
    querySql(sql).then(results => {
      if (results && results.length > 0) {
        resolve(results[0])
      } else {
        resolve(null)
      }
    }).catch(err => {
      reject(err)
    })
  })
}

module.exports = {
  querySql,
  queryOne
}