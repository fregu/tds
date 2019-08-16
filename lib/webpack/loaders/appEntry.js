const fs = require('fs')
const path = require('path')
const { getOptions } = require('loader-utils')
const appTemplate = require('../templates/appEntry')

function flattenChildren(views) {
  return views.reduce(
    (allViews, view) => [
      ...allViews,
      view,
      ...(view.children ? flattenChildren(view.children) : [])
    ],
    []
  )
}
module.exports = function(source) {
  const config = getOptions(this) || {}
  let output = ''
  if (config.entry) {
    output = `
    import App from '${config.entry}'
    export default App
    `
  } else {
    output = appTemplate({
      views: config.src.views.map(view => ({
        ...view,
        route: view.path.replace(/^views\//, '')
      })),
      ...config
    })
  }
  return output
}
