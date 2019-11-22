const fs = require('fs-extra')
const path = require('path')
const { getOptions } = require('loader-utils')
const getNodeModulePath = require('../../getNodeModule')

module.exports = function(source) {
  const config = getOptions(this) || {}

  return `export * from '${config.nodeModules.includes('graphql') ? getNodeModule(config.path, 'graphql/utilities').replace(/\\/g, '\\\\') : 'graphql/utilities'}'`
}
