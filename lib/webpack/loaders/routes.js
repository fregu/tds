const { getOptions } = require("loader-utils");
const routesTemplate = require("../templates/routes");

module.exports = function(source) {
  const config = getOptions(this);
  const routes = config.src.views || [];
  const output = routesTemplate(routes);
  return output;
};
