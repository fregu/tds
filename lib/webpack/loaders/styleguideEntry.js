const { getOptions } = require('loader-utils')
const styleguideTemplate = require('../templates/styleguideEntry')

module.exports = function(source) {
  const config = getOptions(this) || {}

  const { assets, ...src } = config.src
  const { assets: uiAssets, ...uiSrc } = config.ui || {}

  const allComponents = [
    ...Object.keys(src || {}).reduce(
      (allSrc, type) => [
        ...allSrc,
        ...src[type].map(comp => ({ ...comp, type }))
      ],
      []
    ),
    ...Object.keys(uiSrc || {}).reduce(
      (allUI, type) => [
        ...allUI,
        ...uiSrc[type].map(comp => ({ ...comp, type }))
      ],
      []
    )
  ]

  return styleguideTemplate({ ...config, allComponents })
}
