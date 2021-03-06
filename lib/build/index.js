const webpack = require('webpack')
const path = require('path')
const fs = require('fs-extra')
const chalk = require('chalk')

function webpackBuildLogger(err, stats, callback) {
  if (err) {
    console.error('Build errors: ', err.stack || err)
    if (err.details) {
      console.error(err.details)
    }
    return false
  }

  // const info = stats.toJson()
  const info = stats.toJson()
  if (stats.hasErrors()) {
    // info.errors.map(console.error)
  }
  if (stats.hasWarnings()) {
    // console.warn(info.warnings)
  }

  console.log(
    stats.toString({
      hash: false,
      chunks: false, // Makes the build much quieter
      modules: true,
      assets: true,
      children: true,
      colors: true // Shows colors in the console
    })
  )

  if (!stats.hasErrors()) {
    callback()
  }
}

module.exports = function build(config = {}) {
  const isDevMode = !config.mode || config.mode === 'development'
  const webpackConfigs = {
    browser: isDevMode ? '../webpack/browser_dev' : '../webpack/browser_prod',
    server: isDevMode ? '../webpack/server_dev' : '../webpack/server_prod',
    ssr: isDevMode ? '../webpack/ssr_dev' : '../webpack/ssr_prod',
    styleguideBrowser: isDevMode
      ? '../webpack/styleguide_dev'
      : '../webpack/styleguide_prod',
    styleguideServer: isDevMode
      ? '../webpack/styleguide_ssr_dev'
      : '../webpack/styleguide_ssr_prod'
  }
  function compile(webpackConfig, fileSystem) {
    const compiler = webpack(webpackConfig)
    if (fileSystem) {
      compiler.outputFileSystem = fileSystem
    }

    return {
      run(callback) {
        if (!isDevMode) {
          fs.emptyDirSync(compiler.outputPath)
        }

        compiler.run((err, stats) => {
          webpackBuildLogger(err, stats, () => {
            if (!err && typeof callback === 'function') {
              const data = stats.toJson({
                assetsByChunkName: true,
                assets: true,
                modules: false
              })
              const buildAssets = data.children
                ? data.children.reduce(
                    (buildAssets, { assets }) => [
                      ...buildAssets,
                      ...(assets || []).map(a => a.name)
                    ],
                    []
                  )
                : data.assets
              const activeFileSystem = fileSystem || fs
              activeFileSystem.writeFileSync(
                path.resolve(compiler.outputPath, 'assets.json'),
                JSON.stringify(buildAssets, 'utf-8')
              )
              callback({
                buildAssets,
                ...data
              })
            }
          })
        })
      },
      watch(options, callback) {
        console.log(
          chalk.blue('[TDS]:'),
          chalk.green('Watching files for change')
        )
        compiler.watch(
          {
            aggregateTimeout: 300,
            poll: 1000,
            ...options
          },
          (err, stats) => {
            webpackBuildLogger(err, stats, () => {
              const browserCompilers = compiler.compilers || []
              const changedFiles = browserCompilers.reduce(
                (files, compiler) => {
                  const { watchFileSystem } = compiler
                  const watcher =
                    watchFileSystem.watcher || watchFileSystem.wfs.watcher
                  return [...files, ...Object.keys(watcher.mtimes)]
                },
                []
              )

              const data = stats.toJson({
                assetsByChunkName: true,
                assets: true,
                modules: false
              })
              const buildAssets = data.children
                ? data.children.reduce(
                    (buildAssets, { assets }) => [
                      ...buildAssets,
                      ...(assets || []).map(a => a.name)
                    ],
                    []
                  )
                : data.assets

              if (!err && typeof callback === 'function') {
                const status = {
                  // error: stats.hasErrors(),
                  changedFiles,
                  buildAssets,
                  ...data
                }
                callback(status, stats, err)
              }
            })
          }
        )
      },
      devServer(callback) {
        const WebpackDevServer = require('webpack-dev-server')
        const devServerOptions = Object.assign({}, webpackConfig.devServer, {
          stats: {
            colors: true
          },
          contentBase: './dist',
          hot: true,
          historyApiFallback: true,
          host: 'localhost'
        })
        WebpackDevServer.addDevServerEntrypoints(
          webpackConfig,
          devServerOptions
        )
        const server = new WebpackDevServer(compiler, devServerOptions)
        const port = devServerOptions.port || 9000
        server.listen(port, 'localhost', () => {
          console.log('Starting devServer on http://localhost:' + port)
          if (typeof callback === 'function') {
            callback()
          }
        })
      }
    }
  }

  return {
    browser(fileSystem) {
      return compile(require(webpackConfigs.browser), fileSystem)
    },
    ssr(fileSystem) {
      return compile(require(webpackConfigs.server), fileSystem)
    },
    dev(fileSystem) {
      return compile(
        [
          require(webpackConfigs.browser),
          // require(webpackConfigs.server),
          require(webpackConfigs.ssr)
          // require(webpackConfigs.styleguideBrowser),
          // require(webpackConfigs.styleguideServer)
        ],
        fileSystem
      )
    },
    server(fileSystem) {
      // delete dist folder
      return compile(
        [
          // require(webpackConfigs.browser),
          require(webpackConfigs.server)
          // require(webpackConfigs.styleguideBrowser),
          // require(webpackConfigs.styleguideServer)
        ],
        fileSystem
      )
    },
    styleguide(fileSystem) {
      return compile(
        [
          // require(webpackConfigs.browser),
          // require(webpackConfigs.server),
          require(webpackConfigs.styleguideBrowser),
          require(webpackConfigs.styleguideServer)
        ],
        fileSystem
      )
    }
  }
}
