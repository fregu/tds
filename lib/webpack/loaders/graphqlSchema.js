const { getOptions } = require('loader-utils')

module.exports = function(source) {
  const config = getOptions(this)
  if (config.graphql && config.graphql.schema) {
    return `export * from '${config.graphql.schema.replace(/\\/g, '\\\\')}'`
  }

  return 'export default null'
}
