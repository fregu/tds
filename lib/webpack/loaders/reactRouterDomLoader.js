const fs = require("fs");
const path = require("path");
const { getOptions } = require("loader-utils");
const getNodeModule = require('../../utils/getNodeModule')

module.exports = function(source) {
  const config = getOptions(this) || {};

  return `export * from '${config.nodeModules.includes('react-router-dom') ? getNodeModule(config.path, 'react-router-dom').replace(/\\/g, '\\\\') : 'react-router-dom'}'`
}
