const parser = require("./parser");
const defaultConfig = require("./config.default");
const config = parser(".");

module.exports = { ...defaultConfig, ...config };
