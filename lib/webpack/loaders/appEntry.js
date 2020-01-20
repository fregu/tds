const { getOptions } = require('loader-utils')

// function flattenChildren(views) {
//   return views.reduce(
//     (allViews, view) => [
//       ...allViews,
//       view,
//       ...(view.children ? flattenChildren(view.children) : [])
//     ],
//     []
//   )
// }
module.exports = function(source) {
  const config = getOptions(this) || {}
  let output = ''
  if (config.entry) {
    output = `
    import App from '${config.entry.replace(/\\/g, '\\\\')}'
    export default App
    `
  } else {
    const appTemplate = require('../templates/appEntry')
    output = appTemplate({
      views: config.src.views.map(view => ({
        ...view,
        route: view.path
          .match(/(views|pages|routes)(\/|\\)(.*)$/)[3]
          .replace(/\\/g, '/')
      })),
      ...config
    })
  }
  return output
}
