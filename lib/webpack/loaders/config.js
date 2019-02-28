const { getOptions } = require("loader-utils");

module.exports = function() {
  const config = getOptions(this);
  return `export default ${JSON.stringify(config)}`;
};
