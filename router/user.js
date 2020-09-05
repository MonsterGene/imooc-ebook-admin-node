const express = require('express')
const Result = require('../models/Result')
const { login } = require('../service/user')
const { md5 } = require('../utils')
const { PWD_SALT } = require('../utils/constant')

const router = express.Router()

router.post('/login', function (req, res, next) {
  console.log(req.body)
  const { username, password } = req.body
  
  login(username, md5(password + PWD_SALT)).then(user => {
    if (!user || user.length === 0) {
      new Result('登录失败').fail(res)
    } else {
      new Result('登录成功').success(res)
    }
  })
})
router.get('/info', function (req, res, next) {
  res.json('user info...')
})

module.exports = router