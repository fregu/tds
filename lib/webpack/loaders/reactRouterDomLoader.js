const fs = require("fs");
const path = require("path");
const { getOptions } = require("loader-utils");

module.exports = function(source) {
  const config = getOptions(this) || {};
  return `export * from '${
    config.nodeModules.includes('react-router-dom')
      ? `${config.path}/node_modules/`
      : ""
  }react-router-dom'`;
};
