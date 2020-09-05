const { debug } = require('./constant')

module.exports = function log (...rest) {
  if (debug) {
    console.log(...rest)
  }
}