const { getOptions } = require('loader-utils')

module.exports = function(source) {
  const config = getOptions(this)
  const middlewares = (config.server && config.server.middlewares) || []

  const output = `module.exports = [${middlewares
    .map(middlewarePath => `require("${middlewarePath.replace(/\\/g, '\\\\')}")`)
    .join(', ')}];`
  return output
}
