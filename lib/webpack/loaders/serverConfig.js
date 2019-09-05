const { getOptions } = require('loader-utils')

module.exports = function() {
  const { src, ui, ...config } = getOptions(this)
  return `export default ${JSON.stringify(config)}`
}
