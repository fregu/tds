const { getOptions } = require('loader-utils')
const getNodeModule = require('../../utils/getNodeModule')
const path = require('path')
module.exports = function(source) {
  const config = getOptions(this) || {}

  return `export * from '${config.nodeModules.includes('react-redux') ? getNodeModule(config.path, 'react-redux').replace(/\\/g, '\\\\') : 'react-redux'}'`
}
