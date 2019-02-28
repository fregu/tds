const merge = require('webpack-merge')
const path = require('path')
const common = require('./browser_dev')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge.strategy({
  entry: 'replace', // or 'replace', defaults to 'append'
  'module.rules': 'prepend'
})(common, {
  entry: {
    teaser: './kit/entry/teaser.js'
  },
  output: {
    publicPath: '/',
    path: path.resolve(process.cwd(), 'dist', 'teaser'),
    filename: '[name].bundle.js'
  },

  plugins: [
    new HtmlWebPackPlugin({
      template: './kit/entry/teaser.html'
    }),
    new MiniCssExtractPlugin({
      filename: 'teaser.css'
    })
  ]
})
