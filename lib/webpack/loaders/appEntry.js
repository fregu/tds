const fs = require("fs");
const path = require("path");
const { getOptions } = require("loader-utils");
const appTemplate = require("../templates/appEntry");

module.exports = function(source) {
  const config = getOptions(this) || {};
  if (config.entry) {
    return fs.readFileSync(path.resolve(process.cwd(), config.entry), "utf-8");
  } else {
    return appTemplate({ views: config.src.views || [], ...config });
  }
};
