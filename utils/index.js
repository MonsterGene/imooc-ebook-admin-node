const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('./constant')

function isObject (o) {
  return Object.prototype.toString.call(o) === '[object Object]'
}

function md5 (s) {
  return crypto.createHash('md5').update(String(s)).digest('hex')
}

function decodeToken (req) {
  const token = req.get('Authorization').split(' ')[1]
  return jwt.verify(token, PRIVATE_KEY + getClientIp(req))
}

function getClientIp(req) {
  let ip = req.headers['x-real-ip'] || req.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
  req.connection.remoteAddress || // 判断 connection 的远程 IP
  req.socket.remoteAddress // 判断后端的 socket 的 IP
  if (ip.startsWith('::ffff:')) {
    ip = ip.slice(7)
  }
  return ip
}

module.exports = {
  isObject,
  md5,
  decodeToken,
  getClientIp
}