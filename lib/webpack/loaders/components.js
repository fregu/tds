const { getOptions } = require('loader-utils')
const routesTemplate = require('../templates/routes')
const componentTemplate = require('../templates/component')

module.exports = function(source) {
  const config = getOptions(this)
  const components = [
    ...(config.src.components || []).map(component => ({
      ...component,
      route: 'components/' + component.name,
      render: componentTemplate(component)
    })),
    ...(config.src.containers || []).map(container => ({
      ...container,
      route: 'containers/' + container.name,
      render: componentTemplate(container)
    })),
    ...(config.src.views || []).map(view => ({
      ...view,
      route: 'views/' + view.name,
      render: componentTemplate(view)
    }))
  ]
  const output = routesTemplate(components)
  return output
}
