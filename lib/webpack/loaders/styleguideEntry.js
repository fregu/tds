const { getOptions } = require('loader-utils')
const styleguideTemplate = require('../templates/styleguideEntry')

module.exports = function(source) {
  const config = getOptions(this) || {}
  const { assets, ...src } = config.src
  const { assets: uiAssets, ...uiSrc } = config.ui || {}

  const allComponents = [
    ...Object.keys(src).reduce((all, type) => [...all, ...src[type]], []),
    ...((uiSrc && Object.keys(uiSrc)) || []).reduce(
      (all, type) => [...all, ...uiSrc[type]],
      []
    )
  ]

  return styleguideTemplate({ ...config, allComponents })
}
