const findFiles = (fileMatch, tree, single) => {
  const files = (
    (tree &&
      tree.children &&
      tree.children.filter(
        child =>
          child.name.match(new RegExp(fileMatch)) && child.type === 'file'
      )) ||
    []
  ).map(file => file.path)
  return single ? files[0] || false : files
}

module.exports = findFiles
