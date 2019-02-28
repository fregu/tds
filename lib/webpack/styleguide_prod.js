const merge = require('webpack-merge')
const path = require('path')
const common = require('./browser_prod')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const CleanWebpackPlugin = require('clean-webpack-plugin')
module.exports = merge.strategy({
  entry: 'replace', // or 'replace', defaults to 'append'
  plugins: 'replace', // or 'replace', defaults to 'append'
  'module.rules': 'prepend'
})(common, {
  entry: {
    styleguide: './kit/entry/styleguide.js'
  },
  output: {
    publicPath: '/',
    path: path.resolve(process.cwd(), 'dist', 'styleguide'),
    filename: '[name].bundle.js'
  },
  plugins: [
    new HtmlWebPackPlugin({
      template: './kit/entry/index.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'styleguide.css'
    })
  ]
})
