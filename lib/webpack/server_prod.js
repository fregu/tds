const merge = require('webpack-merge')
const CleanWebpackPlugin = require('clean-webpack-plugin')
const serverConfig = require('./server')

module.exports = merge(serverConfig('production'), {
  plugins: [
    // Delete dist folder before every build
    new CleanWebpackPlugin('dist', {
      root: process.cwd(),
      dry: false
    })
  ]
})
