const { getOptions } = require('loader-utils')

module.exports = function(source) {
  const config = getOptions(this)
  const output = config.graphql && config.graphql.typeDefs
  return output
}
