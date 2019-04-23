const webpack = require("webpack");
const webpackDevServer = require("webpack-dev-server");
const path = require("path");

const MemoryFileSystem = require("memory-fs");
const fs = require("fs");
const requireFromString = require("require-from-string");

module.exports = function builder(
  method = "build",
  options = { mode: "development" }
) {
  const mode = options.mode === "production" ? options.mode : "development";
  const configs = {
    production: {
      browser: require("../lib/webpack/browser_prod"),
      server: require("../lib/webpack/server_prod")
    },
    development: {
      browser: require("../lib/webpack/browser_dev")
      //styleguide: require('../lib/webpack/server_prod')
    }
  };

  const methods = {
    config(config) {
      return config;
    },
    build(config, fileSystem) {
      const compiler = webpack(config);

      if (fileSystem) {
        compiler.outputFileSystem = fileSystem;
      }
      compiler.run((err, stats) => {
        if (err) {
          console.error(err.stack || err);
          if (err.details) {
            console.error(err.details);
          }
          return;
        }

        const info = stats.toJson();

        if (stats.hasErrors()) {
          console.error(info.errors);
        } else if (stats.hasWarnings()) {
          console.warn(info.warnings);
        } else {
          console.log("Build done");
        }
      });
    },
    watch(config) {
      const compiler = webpack(config);

      if (fileSystem) {
        compiler.outputFileSystem = fileSystem;
      }
      compiler.watch(
        {
          aggregateTimeout: 300,
          poll: 1000
        },
        (err, stats) => {
          // ...
        }
      );
    },
    devServer(webpackConfig, options) {
      // config.entry.main = [
      //   "webpack-dev-server/client?http://localhost:9000",
      //   "webpack/hot/only-dev-server",
      //   config.entry.main
      // ];
      const compiler = webpack(webpackConfig);
      const devServerOptions = Object.assign({}, webpackConfig.devServer, {
        stats: {
          colors: true
        },
        contentBase: "./dist",
        hot: true,
        historyApiFallback: true,
        //watch: true,
        host: "localhost"
      });
      webpackDevServer.addDevServerEntrypoints(webpackConfig, devServerOptions);
      const server = new webpackDevServer(compiler, devServerOptions);
      const port = devServerOptions.port || 9000;
      server.listen(port, "localhost", () => {
        console.log("Starting server on http://localhost:" + port);
      });
    },
    server(config) {
      const compiler = webpack(config);
      const devServerOptions = Object.assign({}, config.devServer, {
        stats: {
          colors: true
        },
        contentBase: "./dist",
        hot: true,
        host: "localhost"
      });
      webpackDevServer.addDevServerEntrypoints(config, devServerOptions);
      const server = new webpackDevServer(compiler, devServerOptions);
      const port = devServerOptions.port || 9000;
      server.listen(port, "127.0.0.1", () => {
        console.log("Starting server on http://localhost:" + port);
      });
    }
  };

  return methods[method](configs[mode].browser);
};
