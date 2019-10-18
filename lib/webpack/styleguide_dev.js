const merge = require('webpack-merge')
const browser = require('./browser_dev.js')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(browser, {
  entry: path.resolve(__dirname, '..', 'entry/styleguide.js'),
  output: {
    publicPath: '/',
    path: path.resolve(process.cwd(), 'dist'),
    filename: 'styleguide.js'
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'styleguide.css'
    }),
    new HtmlWebPackPlugin({
      template: path.resolve(__dirname, '..', 'entry/index.html'),
      filename: 'styleguide.html'
    })
  ]
})
