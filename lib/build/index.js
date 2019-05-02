const webpack = require("webpack");
const webpackDevServer = require("webpack-dev-server");
const path = require("path");

const MemoryFileSystem = require("memory-fs");
const fs = require("fs");
const requireFromString = require("require-from-string");

function webpackBuildLogger(err, stats, callback) {
  if (err) {
    console.error("Build errors: ", err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return false;
  }

  const info = stats.toJson();

  console.log(
    stats.toString({
      hash: false,
      chunks: false, // Makes the build much quieter
      modules: false,
      assets: false,
      children: false,
      colors: true // Shows colors in the console
    })
  );
  if (!stats.hasErrors()) {
    callback();
  }
}

module.exports = function build(config = {}) {
  const isDevMode = !config.mode || config.mode === "development";
  const webpackConfigs = {
    browser: isDevMode ? "../webpack/browser_dev" : "../webpack/browser_prod",
    server: isDevMode ? "../webpack/server_dev" : "../webpack/server_prod"
  };
  function compile(webpackConfig, fileSystem) {
    const compiler = webpack(webpackConfig);
    if (fileSystem) {
      compiler.outputFileSystem = fileSystem;
    }
    return {
      run(callback) {
        console.log("starting a build");
        compiler.run((err, stats) => {
          webpackBuildLogger(err, stats, () => {
            if (!err && typeof callback === "function") {
              callback(
                stats.toJson({
                  assetsByChunkName: true,
                  assets: true,
                  modules: false
                })
              );
            }
          });
        });
      },
      watch(options, callback) {
        compiler.watch(
          {
            aggregateTimeout: 300,
            poll: 1000,
            ...options
          },
          (err, stats) => {
            webpackBuildLogger(err, stats, () => {
              const browserCompilers = compiler.compilers || [];
              const changedFiles = browserCompilers.reduce(
                (files, compiler) => {
                  const { watchFileSystem } = compiler;
                  const watcher =
                    watchFileSystem.watcher || watchFileSystem.wfs.watcher;
                  return [...files, ...Object.keys(watcher.mtimes)];
                },
                []
              );
              const data = stats.toJson({
                assetsByChunkName: true,
                assets: true,
                modules: false
              });
              const buildAssets = data.children
                ? data.children.reduce(
                    (buildAssets, { assets }) => [
                      ...buildAssets,
                      ...(assets || []).map(a => a.name)
                    ],
                    []
                  )
                : data.assets;

              if (!err && typeof callback === "function") {
                callback({
                  changedFiles,
                  buildAssets,
                  ...data
                });
              }
            });
          }
        );
      },
      devServer(callback) {
        const devServerOptions = Object.assign({}, webpackConfig.devServer, {
          stats: {
            colors: true
          },
          contentBase: "./dist",
          hot: true,
          historyApiFallback: true,
          host: "localhost"
        });
        webpackDevServer.addDevServerEntrypoints(
          webpackConfig,
          devServerOptions
        );
        const server = new webpackDevServer(compiler, devServerOptions);
        const port = devServerOptions.port || 9000;
        server.listen(port, "localhost", () => {
          console.log("Starting devServer on http://localhost:" + port);
          if (typeof callback === "function") {
            callback();
          }
        });
      }
    };
  }

  return {
    browser(fileSystem) {
      return compile(require(webpackConfigs.browser), fileSystem);
    },
    ssr(fileSystem) {
      return compile(require(webpackConfigs.server), fileSystem);
    },
    dev(fileSystem) {
      return compile(
        [require(webpackConfigs.browser), require(webpackConfigs.server)],
        fileSystem
      );
    },
    server(fileSystem) {
      return compile([require(webpackConfigs.server)], fileSystem);
    },
    styleguide(fileSystem) {
      return compile(require(webpackConfigs.styleguide), fileSystem);
    }
  };
};
