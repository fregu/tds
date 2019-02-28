const { getOptions } = require('loader-utils')
const template = require('../templates/readme')

module.exports = function(source) {
  console.log('readmeloader', getOptions(this), this)
  const output = template()
  return output
}
