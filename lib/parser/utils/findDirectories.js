const findDirectories = (folderMatch, tree, single) => {
  const dirs =
    (tree &&
      tree.children &&
      tree.children.filter(
        child =>
          child.name.match(new RegExp(folderMatch)) &&
          child.type === 'directory'
      )) ||
    []
  return single ? dirs[0] || false : dirs
}
module.exports = findDirectories
