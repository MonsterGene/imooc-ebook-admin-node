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
  return jwt.verify(token, PRIVATE_KEY)
}

module.exports = {
  isObject,
  md5,
  decodeToken
}