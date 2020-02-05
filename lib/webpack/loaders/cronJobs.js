const { getOptions } = require('loader-utils')

module.exports = function(source) {
  const config = getOptions(this)
  const cronFile = config.server && config.server.cron

  const output = `module.exports = ${
    cronFile ? `require("${cronFile}")` : 'false'
  }`
  return output
}
