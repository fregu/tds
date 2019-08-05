const { getOptions } = require("loader-utils");

module.exports = function() {
  const { server = {}, graphql = {}, keys = {} } = getOptions(this);
  return `export default ${JSON.stringify({ server, graphql, keys })}`;
};
