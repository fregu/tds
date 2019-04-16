const fs = require("fs");
const path = require("path");
const { getOptions } = require("loader-utils");

module.exports = function(source) {
  const config = getOptions(this) || {};
  return `export * from '${
    config.node_modules["react-apollo"] ? `${config.path}/node_modules/` : ""
  }react-apollo'`;
};
