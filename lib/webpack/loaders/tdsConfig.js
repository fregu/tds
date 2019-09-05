const { getOptions } = require('loader-utils')

module.exports = function(source) {
  const options = getOptions(this)
  // Can I parse entire project and change any filePath to imports (require) in the top so they will get bundled in build time
  return output
}
