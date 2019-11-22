const fs = require("fs");
const path = require("path");
const { getOptions } = require("loader-utils");
const getNodeModulePath = require('../../getNodeModule')


module.exports = function(source) {
  const config = getOptions(this) || {};
    return `export * from '${config.nodeModules.includes('react-apollo') ? getNodeModule(config.path, 'react-apollo').replace(/\\/g, '\\\\') : 'react-apollo'}'`
