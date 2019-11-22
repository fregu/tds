const path = require('path')

module.exports = function getNodeModulePath(root, packageName) {
  const packageRoot = path.resolve(root, 'node_modules', ...packageName.split('/'))
  const packageJson = require(path.resolve(packageRoot, 'package.json'))
  if (packageJson.main) {
    return path.resolve(packageRoot, packageJson.main)
  } else {
    return packageRoot
  }
}
