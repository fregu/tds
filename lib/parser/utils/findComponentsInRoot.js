const findComponents = require('./findComponents')

const findComponentsInRoot = root => {
  if (!root || !root.children) {
    return []
  }

  return findComponents(root.children, root)
}
module.exports = findComponentsInRoot
