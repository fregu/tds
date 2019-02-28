const merge = require('webpack-merge')
const common = require('./common.js')('development')
const HtmlWebPackPlugin = require('html-webpack-plugin')
// const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

module.exports = merge(common, {
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './dist'
  },
  output: {
    publicPath: '/'
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './kit/entry/index.html'
    })
  ]
})
