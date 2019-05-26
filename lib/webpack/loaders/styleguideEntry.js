const { getOptions } = require('loader-utils')
const styleguideTemplate = require('../templates/styleguideEntry')

module.exports = function(source) {
  const config = getOptions(this) || {}
  return styleguideTemplate(config)
}
