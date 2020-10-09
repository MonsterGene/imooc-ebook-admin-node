const express = require('express')
const multer = require('multer')
const Result = require('../models/Result')
const Book = require('../models/Book')
const { decodeToken } = require('../utils')

const boom = require('boom')
const { UPLOAD_PATH } = require('../utils/constant')
const bookService = require('../service/book')

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

router.post('/create', function (req, res, next) {
  const decodedToken = decodeToken(req)
  if (decodedToken && decodedToken.username) {
    req.body.username = decodedToken.username
  }
  const book = new Book(null, req.body)
  bookService.insertBook(book).then(() => {
    new Result(null, '添加电子书成功').success(res)
  }).catch(err => {
    next(boom.badImplementation(err))
  })
})

router.post('/update', function (req, res, next) {
  const decodedToken = decodeToken(req)
  if (decodedToken && decodedToken.username) {
    req.body.username = decodedToken.username
  }
  const book = new Book(null, req.body)
  bookService.updateBook(book).then(() => {
    new Result(null, '更新电子书成功').success(res)
  }).catch(err => {
    next(boom.badImplementation(err))
  })
})

router.get('/get', function (req, res, next) {
  const { fileName } = req.query
  if (!fileName) {
    next(boom.badRequest(new Error('参数fileName不能为空！')))
  } else {
    bookService.getBook(fileName).then(book => {
      new Result(book, '获取图书信息成功').success(res)
    }).catch(err => {
      next(boom.badImplementation(err))
    })
  }
})

router.get('/category', function (req, res, next) {
  bookService.getCategory().then(category => {
    new Result(category, '获取分类成功').success(res)
  }).catch(err => {
    next(boom.badImplementation(err))
  })
})

router.get('/list', function (req, res, next) {
  bookService.listBook(req.query).then(data => {
    new Result(data, '获取图书列表成功').success(res)
  }).catch(err => {
    next(boom.badImplementation(err))
  })
})


router.get('/delete', function (req, res, next) {
  const { fileName } = req.query
  if (!fileName) {
    next(boom.badRequest(new Error('参数fileName不能为空！')))
  } else {
    bookService.deleteBook(fileName).then(() => {
      new Result('删除图书成功').success(res)
    }).catch(err => {
      next(boom.badImplementation(err))
    })
  }
})

module.exports = router