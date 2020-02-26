const path = require('path')
const { getOptions } = require('loader-utils')
const template = require('../templates/icons')

module.exports = function(source) {
  const currIcons = (
    source.match(/export \{ ?default as (.*) ?\} from ['"]([^"']*)['"]/g) || []
  ).reduce((currIcons, source) => {
    const [__, name, src] =
      source.match(/export \{ ?default as ([^ ]*) ?\} from ['"]([^"']*)['"]/) ||
      []

    return { ...currIcons, ...(name && src ? { [name]: src } : {}) }
  }, {})

  const config = getOptions(this) || {}
  const appIcons =
    Object.keys((config.src.assets && config.src.assets.icons) || {})
      .filter(name => !currIcons[name])
      .reduce(
        (all, iconName) => ({
          ...all,
          ...{
            [iconName]: path.resolve(
              config.path,
              config.src.assets.icons[iconName]
            )
          }
        }),
        currIcons
      ) || {}

  const newSource = template(source, appIcons, currIcons, config)

  return newSource
}
