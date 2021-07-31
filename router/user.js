const express = require('express')
const https = require('https')
const qs = require('querystring')
const moment = require('moment')
const { aliSMSApiCode } = require('../../ebook_production_config');
const Result = require('../models/Result')
const { login, findUser } = require('../service/user')
const { decodeToken, getClientIp, md5 } = require('../utils')
const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED } = require('../utils/constant')
const { body, validationResult } = require('express-validator')
const boom = require('boom')
const jwt = require('jsonwebtoken')
const log = require('../utils/log');
const db = require('../db');

const router = express.Router()

/**
 * 通过手机验证码登录
 */
router.post('/login', [
  body('username').isString().withMessage('用户名必须为字符串'),
  body('loginType').isString().withMessage('登录类型必须为字符串'),
  body('password').isString().withMessage('密码或验证码必须为字符串')
], function (req, res, next) {
  const err = validationResult(req)
  if (!err.isEmpty()) {
    const [{ msg }] = err.errors
    next(boom.badRequest(msg))
  } else {
    const { username, password, loginType } = req.body
    let ip = getClientIp(req)
    login(username, loginType, password, ip).then(valid => {
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
router.get('/valid-code', async function (ctx, res, next) {
  console.log(ctx.query)
  const { username } = ctx.query
  // new Result(null, '验证码发送成功').success(res)
  const [user] = await db.querySql(`select phoneNumber from admin_user where username='${username}'`)
  const phoneNumber = user && user.phoneNumber
  if (!user) {
    return new Result(`用户不存在`).fail(res)
  }
  console.log(phoneNumber)
  const maxNum = 1000000
  const minNum = 99999
  const validCode = (Math.random()*(maxNum-minNum+1)+minNum).toFixed(0)
  const vcExpireMin = 5
  const data = qs.stringify({
    content: `code:${validCode},expire_at:${vcExpireMin}`,
    phone_number: phoneNumber,
    template_id: 'TPL_0001'
  })
  const req = https.request('https://dfsns.market.alicloudapi.com/data/send_sms', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(data),
      Authorization: `APPCODE ${aliSMSApiCode}`
    }
  }, SMSRes => {
    if (SMSRes.statusCode !== 200) {
      console.log(SMSRes.statusCode, SMSRes.statusMessage)
      new Result(`发送验证码失败, ${SMSRes.statusCode}：${SMSRes.statusMessage}`).fail(res)
    } else {
      SMSRes.setEncoding('utf8')
      let resData = ''
      SMSRes.on('data', chunk => {
        console.log('接收到数据: ', chunk)
        resData += chunk
      })
      SMSRes.on('error', err => {
        console.log('响应出错：', err)
      })
      SMSRes.on('end', async () => {
        console.log('短信请求结束')
        console.log(resData)
        try {
          await db.insert({
            username,
            validCode,
            validCodeExpire: moment(new Date(Date.now() + vcExpireMin * 60 * 1000)).format('YYYY-MM-DD HH:mm:ss'),
            validStatus: '未登录',
            loginIP: getClientIp(ctx)
          }, 'admin_user_login')
          new Result(null, '验证码发送成功').success(res)
        } catch (e) {
          console.log(e.message)
          new Result(null, '验证码服务端储存出错').fail(res)
        }
      })
    }
  })
  req.on('error', (e) => {
    console.log(e)
    new Result('发送验证码出错').fail(res)
  })
  console.log('data: ', data)
  req.write(data)
  req.end()
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