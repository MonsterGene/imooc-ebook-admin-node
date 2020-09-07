const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { PRIVATE_KEY } = require('./constant')

function md5 (s) {
  return crypto.createHash('md5').update(String(s)).digest('hex')
}

function decodeToken (req) {
  const token = req.get('Authorization').split(' ')[1]
  return jwt.verify(token, PRIVATE_KEY)
}

module.exports = {
  md5,
  decodeToken
}