const { getOptions } = require('loader-utils')
const scriptsTemplate = require('../templates/scripts')

module.exports = function(source) {
  const config = getOptions(this)
  console.log('config', config)
  const scripts = []
  const output = scriptsTemplate(scripts)
  return output
}
