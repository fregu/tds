const fs = require('fs')

module.exports = function(filePath, fileSystem = fs, logLevelVerbose) {
  let content = false

  try {
    content = fileSystem.readFileSync(filePath, 'utf-8')
  } catch (err) {
    if (logLevelVerbose) {
      console.error('could not load', filePath, 'from fileSystem: ', err)
    }
  }

  return content
}
