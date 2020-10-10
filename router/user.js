const express = require('express')
const Result = require('../models/Result')
const { login, findUser } = require('../service/user')
const { md5, decodeToken } = require('../utils')
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')
const { body, validationResult } = require('express-validator')
const boom = require('boom')
const jwt = require('jsonwebtoken')

const router = express.Router()

router.post('/login', [
  body('username').isString().withMessage('用户名必须为字符串'),
  body('password').isString().withMessage('密码必须为字符串')
], function (req, res, next) {
  const err = validationResult(req)
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors
    next(boom.badRequest(msg))
  } else {
    const { username, password } = req.body
    
    login(username, md5(password + PWD_SALT)).then(user => {
      if (!user || user.length === 0) {
        new Result('登录失败').fail(res)
      } else {
        const token = jwt.sign(
          { username },
          PRIVATE_KEY,
          { expiresIn: JWT_EXPIRED }
        )
        new Result({ token }, '登录成功').success(res)
      }
    }).catch(err => {
      console.log(err)
      next(boom.badImplementation(err))
    })
  }
})
router.get('/info', function (req, res, next) {
  const jwtInfo = decodeToken(req)
  if (jwtInfo && jwtInfo.username) {
    findUser(jwtInfo.username).then(user => {
      if (user) {
        user.roles = [user.role]
        new Result(user, '用户信息查询成功').success(res)
      } else {
        new Result('用户信息查询失败').fail(res)
      }
    }).catch(err => {
      next(boom.badImplementation(err))
    })

  }
})

module.exports = router