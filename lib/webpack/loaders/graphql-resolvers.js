const { getOptions } = require('loader-utils')
const template = require('../templates/scripts')

module.exports = function(source) {
  const config = getOptions(this)
  const resolvers = config.graphql && config.graphql.resolvers
  const output = resolvers ? template(resolvers) : ''
  return output
}
