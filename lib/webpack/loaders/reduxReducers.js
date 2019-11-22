const { getOptions } = require('loader-utils')
const template = require('../templates/scripts')

module.exports = function(source) {
  const config = getOptions(this)
  const reducers = config.store && config.store.reducers
  const output = reducers ? template(reducers) : ''

  return output
}
