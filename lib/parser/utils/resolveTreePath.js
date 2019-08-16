const resolveTreePath = (tree, firstArg, ...restArgs) => {
  // step through args and test any regexp on all children
  if (tree.children && firstArg) {
    const childMatch = tree.children.find(child =>
      child.name.match(new RegExp(firstArg))
    )
    // parse deeper
    if (childMatch && restArgs.length) {
      return resolveTreePath(childMatch, ...restArgs)
    }
    // or return match
    return childMatch
  } else if (!firstArg) {
    // If mor path return tree
    return tree
  }
  // Or no match
  return false
}
module.exports = resolveTreePath
