const UPLOAD_PATH = process.env.NODE_ENV === 'development' ? 'D:\\StudySpace\\NginxWWW\\imooc-ebook-admin\\upload' : '/root/nginx/www/ebook-admin-upload'
const OLD_UPLOAD_URL = 'http://ebook.ourclubs.cn:8189/book/res/img'
const UPLOAD_URL = 'http://ebook.ourclubs.cn:8189'

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
  OLD_UPLOAD_URL,
  UPLOAD_URL
}