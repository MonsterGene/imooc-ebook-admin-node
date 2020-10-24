const { querySql, queryOne } = require("../db")
const moment = require('moment')

function login (username, validCode, ip) {
  return querySql(`select * from admin_user_login where username='${username}' and validCode='${validCode}' and validCodeExpire > '${moment().format('YYYY-MM-DD HH:mm:ss')}' and loginIP='${ip}'`)
}

function findUser(username) {
  return queryOne(`select id, username, nickname, role, avatar from admin_user where username='${username}'`)
}

module.exports = {
  login,
  findUser
}
