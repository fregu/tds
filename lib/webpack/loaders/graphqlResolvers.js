const { getOptions } = require('loader-utils')

module.exports = function(source) {
  const config = getOptions(this)
  const resolvers = config.graphql && config.graphql.resolvers
  if (resolvers) {
    return resolvers.map(resolver => `export * from '${resolver}'`).join(`
      `)
  }

  return 'export default null'
}
