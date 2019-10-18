const { getOptions } = require('loader-utils')
const fs = require('fs')

module.exports = function(source) {
  const config = getOptions(this)
  const types = (config.graphql && config.graphql.types) || []
  const output = types
    .map(filePath => fs.readFileSync(filePath, 'utf-8').toString())
    .join('\n')

  return output
}
