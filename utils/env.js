proccessArg = process.argv.slice(2).reduce((acc, cur) => {
  [key, val] = cur.split("=")
  acc[key] = val
  return acc
}, {})

module.exports = { env: proccessArg.env }
