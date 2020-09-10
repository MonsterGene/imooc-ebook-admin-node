const express = require('express')
const multer = require('multer')
const Result = require('../models/Result')
const Book = require('../models/Book')

const { PWD_SALT, PRIVATE_KEY, JWT_EXPIRED, UPLOAD_PATH } = require('../utils/constant')
const { body, validationResult } = require('express-validator')
const boom = require('boom')
const jwt = require('jsonwebtoken')

const router = express.Router()

router.post('/upload', multer({ dest: `${UPLOAD_PATH}/book` }).single('file'), function (req, res, next) {
  if (!req.file || req.file.length === 0) {
    new Result('上传电子书失败').fail(res)
  } else {
    const book = new Book(req.file)
    console.log(book)
    book.parse().then(book => {
      new Result(book, '上传电子书成功').success(res)
    }).catch(err => {
      console.log(err)
      next(boom.badImplementation(err))
    })
  }
})

module.exports = router