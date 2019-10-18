const findFiles = require('./findFiles')
const findComponentsInRoot = require('./findComponentsInRoot')
const resolveTreePath = require('./resolveTreePath')
function getFileName(path) {
  return path.match(/([^/]*)\.[^.]*$/)[1]
}
const setRelativePath = (path, importPath) => component => {
  return component.path
    ? {
        ...component,
        path: component.path.replace(path, importPath)
      }
    : component
}

const findSrc = (tree, importPath) =>
  tree && {
    assets: {
      icons: findFiles(
        /\.svg$/,
        resolveTreePath(tree, 'assets?', 'icons')
      ).reduce((all, path) => ({ ...all, [getFileName(path)]: path }), {}),
      images: findFiles(
        /\.(jpe?g|png|gif|svg|webm)/,
        resolveTreePath(tree, 'assets', /(imgs?|images?)/)
      ),
      fonts: findFiles(
        /\.(woff|woff2|svg|eot|otf)$/,
        resolveTreePath(tree, 'assets', /fonts?/)
      )
    },
    patterns: findComponentsInRoot(resolveTreePath(tree, /base|patterns/))
      .filter(Boolean)
      .map(setRelativePath(tree.path + '/', importPath)),
    components: findComponentsInRoot(resolveTreePath(tree, /components|bricks/))
      .filter(Boolean)
      .map(setRelativePath(tree.path + '/', importPath)),
    containers: findComponentsInRoot(
      resolveTreePath(tree, /containers|modules|kits/)
    )
      .filter(Boolean)
      .map(setRelativePath(tree.path + '/', importPath)),
    helpers: findComponentsInRoot(resolveTreePath(tree, /helpers|utils/))
      .filter(Boolean)
      .map(setRelativePath(tree.path + '/', importPath)),
    views: findComponentsInRoot(resolveTreePath(tree, /views|pages/))
      .filter(Boolean)
      .map(setRelativePath(tree.path + '/', importPath))
  }
module.exports = findSrc
