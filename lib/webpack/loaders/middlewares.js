const { getOptions } = require('loader-utils')
const template = require('../templates/scripts')

module.exports = function(source) {
  const config = getOptions(this)
  const middlewares = config.store && config.store.middlewares
  const output = middlewares ? template(middlewares) : ''
  return output
}
