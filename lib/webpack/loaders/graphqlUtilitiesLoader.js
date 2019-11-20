const fs = require('fs-extra')
const path = require('path')
const { getOptions } = require('loader-utils')

module.exports = function(source) {
  const config = getOptions(this) || {}

  return `export * from '${
    config.nodeModules.includes('graphql') ? `${config.path}/node_modules/` : ''
  }graphql/utilities'`
}
