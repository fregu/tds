module.exports = function pathToPascalCase(path) {
  return path
    .split('/')
    .map(part => `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}`)
    .join('')
}
