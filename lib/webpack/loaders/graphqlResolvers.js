const { getOptions } = require('loader-utils')
const template = require('../templates/scripts')

module.exports = function(source) {
  const config = getOptions(this)
  const resolvers = config.graphql && config.graphql.resolvers
  if (config.graphql.resolvers) {
    return `
      import resolvers from '${config.graphql.resolvers}'
      export default resolvers
    `
  }

  return 'export default null'
}
