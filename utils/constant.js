const { env } = require('./env')
const UPLOAD_PATH = env === 'dev' ? 'D:\\StudySpace\\NginxWWW\\imooc-ebook-admin\\upload' : ''
const UPLOAD_URL = 'https://ebook.ourclubs.cn:8189'

module.exports = {
  CODE_TOKEN_EXPIRED: -2,
  CODE_ERROR: -1,
  CODE_SUCCESS: 0,
  debug: true,
  PWD_SALT: 'admin_imooc_node',
  PRIVATE_KEY: 'imooc-ebook-admin',
  JWT_EXPIRED: 60 * 60,
  UPLOAD_PATH,
  MIME_TYPE_EPUB: 'application/epub+zip',
  UPLOAD_URL
}