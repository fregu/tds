const requireFromString = require('require-from-string')
const fs = require('fs')

module.exports = function(filePath, fileSystem = fs, logLevelVerbose) {
  let requiredModule = {}

  try {
    const content = fileSystem.readFileSync(filePath, 'utf-8')
    requiredModule = requireFromString(content, filePath)
  } catch (err) {
    if (logLevelVerbose) {
      console.error('could not load', filePath, 'from fileSystem: ', err)
    }
  }

  return requiredModule
}
