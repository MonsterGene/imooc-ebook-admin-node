const express = require('express')
const https = require('https')
const { aliSMSApiCode } = require('../../ebook_production_config');
const Result = require('../models/Result')
const { login, findUser } = require('../service/user')
const { decodeToken, getClientIp } = require('../utils')
const { PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')
const { body, validationResult } = require('express-validator')
const boom = require('boom')
const jwt = require('jsonwebtoken')
const log = require('../utils/log');
const db = require('../db');

const router = express.Router()

router.post('/login', [
  body('username').isString().withMessage('用户名必须为字符串'),
  body('validCode').isString().withMessage('密码必须为字符串')
], function (req, res, next) {
  const err = validationResult(req)
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors
    next(boom.badRequest(msg))
  } else {
    const { username, validCode } = req.body
    let ip = getClientIp(req)
    login(username, validCode, ip).then(valid => {
      if (!valid || valid.length === 0) {
        new Result('登录失败').fail(res)
      } else {
        const token = jwt.sign(
          { username },
          PRIVATE_KEY + ip,
          { expiresIn: JWT_EXPIRED }
        )
        new Result({ token }, '登录成功').success(res)
      }
    }).catch(err => {
      log(err)
      next(boom.badImplementation(err))
    })
  }
})

/** 获取短信验证码 */
router.get('/valid-code', function (req, res, next) {
  const jwtInfo = decodeToken(req)
  if (jwtInfo && jwtInfo.username) {
    const maxNum = 1000000
    const minNum = 99999
    const validCode = (Math.random()*(maxNum-minNum+1)+minNum,10).toFixed(0)
    const data = {
      content: 'code:1234,expire_at:5',
      phone_number: ''
    }
    db.querySql(`select phoneNumber from admin_user where username='${jwtInfo.username}'`).then(user => {
      console.log(user)
    })
    const req = https.request('https://dfsns.market.alicloudapi.com/data/send_sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(),
        Authorization: `APPCODE ${aliSMSApiCode}`
      }
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