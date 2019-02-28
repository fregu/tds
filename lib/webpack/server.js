const common = require("./common.js");
const path = require("path");

module.exports = mode => {
  const config = common(mode);
  return {
    ...config,
    mode: mode,
    ///devtool: "source-map",
    entry: path.resolve(__dirname, "..", "entry/ssr.js"),
    output: {
      publicPath: "/",
      path: path.resolve(process.cwd(), "dist"),
      library: "ssr",
      libraryTarget: "umd", // export as importable UMD-module
      filename: "ssr.js"
    },
    target: "node",

    // Use loaders from webpack-config, except css loader
    module: {
      rules: [
        ...config.module.rules.filter(rule => !".css".match(rule.test)),
        { test: /\.css$/, use: "null-loader" },
        { test: /\.html$/, use: "raw-loader" }
      ]
    }
  };
};
