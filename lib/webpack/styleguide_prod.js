const merge = require('webpack-merge')
const path = require('path')
const browser = require('./browser_prod')
const HtmlWebPackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
// const {CleanWebpackPlugin} = require('clean-webpack-plugin')
module.exports = merge.strategy({
  entry: 'replace', // or 'replace', defaults to 'append'
  plugins: 'replace', // or 'replace', defaults to 'append'
  'module.rules': 'prepend'
})(
  { ...browser, plugins: [] },
  {
    entry: path.resolve(__dirname, '..', 'entry/client.js'),
    output: {
      publicPath: '/',
      path: path.resolve(process.cwd(), 'dist', 'styleguide'),
      filename: 'styleguide.js'
    },
    plugins: [
      new HtmlWebPackPlugin({
        template: './kit/entry/index.html',
        filename: 'styleguide.html'
      }),
      new MiniCssExtractPlugin({
        filename: 'styleguide.css'
      })
    ]
  }
)
