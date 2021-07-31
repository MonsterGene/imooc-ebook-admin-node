const expressJwt = require('express-jwt')
const { getClientIp } = require('../utils')
const { PRIVATE_KEY } = require('../utils/constant')

const jwtAuth = (err, req, res, next) => {
  next(expressJwt({
    algorithms: ['HS256'],
    secret: PRIVATE_KEY + getClientIp(req),
    credentialsRequired: true,
  }).unless({
    path: [
      '/',
      '/user/login',
      '/user/valid-code'
    ]
  }))
}

module.exports = jwtAuth
