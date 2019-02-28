const { getOptions } = require('loader-utils')
const routesTemplate = require('../templates/routes')

module.exports = function(source) {
  const config = getOptions(this)
  const components = [
    ...(config.src.components || []).map(component => ({
      ...component,
      route: 'components/' + component.name
    })),
    ...(config.src.containers || []).map(container => ({
      ...container,
      route: 'containers/' + container.name
    })),
    ...(config.src.views || []).map(view => ({
      ...view,
      route: 'views/' + view.name
    }))
  ]
  const output = routesTemplate(components)
  return output
}
