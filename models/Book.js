const { MIME_TYPE_EPUB, UPLOAD_URL, UPLOAD_PATH } = require('../utils/constant')
const fs = require('fs')
const Epub = require('../utils/epub')
const xml2js = require('xml2js').parseString

class Book {
  constructor(file, data) {
    if (file) {
      this.createBookFromFile(file)
    } else {
      this.createBookFromData(data)
    }
  }

  createBookFromFile(file) {
    const {
      destination,
      filename,
      mimetype = MIME_TYPE_EPUB,
      path,
      originalname
    } = file
    const suffix = mimetype === MIME_TYPE_EPUB ? '.epub' : ''
    const oldBookPath = path
    const bookPath = `${destination}/${filename}${suffix}`
    const url = `${UPLOAD_URL}/book/${filename}${suffix}`
    const unzipPath = `${UPLOAD_PATH}/unzip/${filename}`
    const unzipUrl = `${UPLOAD_URL}/unzip/${filename}`
    
    if (!fs.existsSync(unzipPath)) {
      fs.mkdirSync(unzipPath, { recursive: true })
    }
    if (fs.existsSync(oldBookPath) && !fs.existsSync(bookPath)) {
      fs.renameSync(oldBookPath, bookPath)
    }
    this.fileName = filename
    this.path = `/book/${filename}${suffix}`
    this.filePath = this.path
    this.url = url
    this.title = ''
    this.author = ''
    this.publisher = ''
    this.contents = []
    this.cover = ''
    this.coverPath = ''
    this.category = -1
    this.categoryText = ''
    this.language = ''
    this.unzipPath = `/unzip/${filename}`
    this.unzipUrl = unzipUrl
    this.originalName = originalname
  }
  createBookFromData(data) {
    // console.log(data)
  }

  parse() {
    return new Promise((resolve, reject) => {
      const bookPath = `${UPLOAD_PATH}${this.filePath}`
      if (!fs.existsSync(bookPath)) {
        // console.log(bookPath)
        reject(new Error('电子书不存在'))
      } else {
        const epub = new Epub(bookPath)
        epub.on('error', err => {
          reject(err)
        })
        epub.on('end', err => {
          if (err) {
            reject(err)
          } else {
            // console.log(epub.metadata)
            const {
              language,
              creator,
              creatorFileAs,
              title,
              cover,
              publisher,
            } = epub.metadata
            if (!title) {
              reject(new Error('图书标题为空'))
            } else {
              this.title = title
              this.language = language || 'en'
              this.author = creator || creatorFileAs || 'unknow'
              this.rootFile = epub.rootFile
              this.publisher = publisher
              const handleGetImage = (err, file, mimeType) => {
                // console.log(err, file, mimeType)
                if (err) {
                  reject(err)
                } else {
                  const suffix = mimeType.split('/')[1]
                  const coverPath = `${UPLOAD_PATH}/img/${this.fileName}.${suffix}`
                  const coverUrl = `${UPLOAD_URL}/img/${this.fileName}.${suffix}`
                  fs.writeFileSync(coverPath, file, 'binary')
                  this.coverPath = `/img/${this.fileName}.${suffix}`
                  resolve(this)
                }
              }
              try {
                this.unzip()
                this.parseContents(epub).then(({ chapters }) => {
                  this.contents = chapters
                  epub.getImage(cover, handleGetImage)
                })
              } catch (e) {
                reject(e)
              }
            }
          }
        })
        epub.parse()
      }
    })
  }

  unzip () {
    const AdmZip = require('adm-zip')
    const zip = new AdmZip(Book.genPath(this.path))
    zip.extractAllTo(Book.genPath(this.unzipPath), true)
  }

  parseContents (epub) {
    function getNcxFilePath() {
      const spine = epub && epub.spine
      const manifest = epub && epub.manifest
      const ncx = spine.toc && spine.toc.href
      const id = spine.toc && spine.toc.id
      if (ncx) {
        return ncx
      } else {
        return manifest[id].href
      }
    }
    function findParent (arr, level = 0, pid = '') {
      return arr.map(item => {
        item.level = level
        item.pid = pid
        if (item.navPoint && item.navPoint.length > 0) {
          item.navPoint = findParent(item.navPoint, level + 1, item['$'].id)
        } else if (item.navPoint) {
          item.navPoint.level = level + 1
          item.navPoint.pid = item['$'].id
        }
        return item
      })
    }
    function flatten (arr) {
      return [].concat(...arr.map(item => {
        if (item.navPoint && item.navPoint.length > 0) {
          return [].concat(item, ...flatten(item.navPoint))
        } else if (item.navPoint) {
          return [].concat(item, item.navPoint)
        }
        return item
      }))
    }
    const ncxFilePath = Book.genPath(`${this.unzipPath}/${getNcxFilePath()}`)
    if (fs.existsSync(ncxFilePath)) {
      return new Promise((resolve, reject) => {
        const xml = fs.readFileSync(ncxFilePath, 'utf-8')
        const fileName = this.fileName
        xml2js(xml, {
          explicitArray: false,
          ignoreAttrs: false
        }, function (err, json) {
          if (err) {
            reject(err)
          } else {
            const navMap = json.ncx.navMap
            if (navMap.navPoint && navMap.navPoint.length > 0) {
              navMap.navPoint = findParent(navMap.navPoint)
              const newNavMap = flatten(navMap.navPoint)
              const chapters = []
              epub.flow.forEach((chapter, index) => {
                if (index + 1 > newNavMap.length) {
                  return
                }
                const nav = newNavMap[index]
                chapter.text = `${UPLOAD_URL}/unzip/${fileName}/${chapter.href}`
                if (nav && nav.navLabel) {
                  chapter.label = nav.navLabel.text || ''
                } else {
                  chapter.label = ''
                }
                chapter.level = nav.level
                chapter.pid = nav.pid
                chapter.navId = nav['$'].id
                chapter.fileName = fileName
                chapter.order = index + 1
                chapters.push(chapter)
              })
              resolve({ chapters })
            } else {
              console.log('--------------------------')
              console.log('navPoint: ', navMap.navPoint)
              reject(new Error('目录解析失败，目录树为空'))
            }
          }
        })
      })
    } else {
      throw new Error('目录对应的资源文件不存在')
    }
  }

  static genPath (path) {
    if (!path.startsWith('/')) {
      path = `/${path}`
    }
    return `${UPLOAD_PATH}${path}`
  }
}


module.exports = Book