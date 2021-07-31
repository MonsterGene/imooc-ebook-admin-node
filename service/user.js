const { querySql, queryOne } = require("../db")
const moment = require('moment')

function login (username, loginType, validCode, ip) {
  if (loginType === 'vc') {
    return querySql(`select * from admin_user_login where username='${username}' and validCode='${validCode}' and validCodeExpire > '${moment().format('YYYY-MM-DD HH:mm:ss')}' and validStatus='未登录' and loginIP='${ip}'`)
  } else {
    return querySql(`select * from admin_user_login where username='${username}' and validCode='${validCode}' and validCodeExpire > '${moment().format('YYYY-MM-DD HH:mm:ss')}' and validStatus='未登录' and loginIP='${ip}'`)
  }
}

function findUser(username) {
  return queryOne(`select id, username, nickname, role, avatar from admin_user where username='${username}'`)
}

module.exports = {
  login,
  findUser
}
