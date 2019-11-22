const { getOptions } = require('loader-utils')
const appTemplate = require('../templates/appEntry')

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
    console.log('config.src.views', config.src.views, config.src.views[0].path.match(/(views|pages|routes)(\/|\\)(.*)$/)[3].replace(/\\/g, '/'))
    output = appTemplate({
      views: config.src.views.map(view => ({
        ...view,
        route: view.path.match(/(views|pages|routes)(\/|\\)(.*)$/)[3].replace(/\\/g, '/')
      })),
      ...config
    })
  }
  return output
}
