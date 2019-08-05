const { getOptions } = require('loader-utils')
const template = require('../templates/scripts')

module.exports = function(source) {
  const config = getOptions(this)
  const middlewares = config.server && config.server.middlewares
  const output = middlewares ? template(middlewares) : ''
  return output
}
