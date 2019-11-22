const { getOptions } = require("loader-utils");
const template = require("../templates/scripts");

module.exports = function(source) {
  const json = source
    .replace(/^module.exports = /, "")
    .replace(/;$/, "")
    .replace(/__webpack_public_path__ \+ "/g, '"__webpack/');
  return source;
};
