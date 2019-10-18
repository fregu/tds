const common = require('./common.js')
// const CleanWebpackPlugin = require('clean-webpack-plugin')
const path = require('path')

module.exports = (mode = 'production') => {
  const config = common(mode)
  return {
    ...config,
    mode: mode,
    /// devtool: "source-map",
    node: {
      __dirname: false
    },
    entry: {
      // config: path.resolve(__dirname, "..", "config.js"),
      ssr: path.resolve(__dirname, '..', 'entry/ssr.js'),
      server: path.resolve(__dirname, '..', 'entry/server.js')
    },
    output: {
      publicPath: '/',
      path: path.resolve(process.cwd(), 'dist'),
      library: 'ssr',
      libraryTarget: 'umd' // export as importable UMD-module
    },
    target: 'node',

    // Use loaders from webpack-config, except css loader
    module: {
      rules: [
        ...config.module.rules.filter(rule => !'.css'.match(rule.test)),
        { test: /\.css$/, use: 'null-loader' },
        { test: /\.html$/, use: 'raw-loader' }
      ]
    },
    plugins: [
      ...(config.plugins || [])
      // new CleanWebpackPlugin('dist', {
      //   root: process.cwd(),
      //   dry: true
      // })
    ]
  }
}
