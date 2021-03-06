const merge = require('webpack-merge')
const common = require('./common.js')('development')
// const webpack = require("webpack");
const config = require('../config')()
const HtmlWebPackPlugin = require('html-webpack-plugin')
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(
  common,
  {
    mode: 'development',
    devtool: 'inline-source-map',
    entry: path.resolve(__dirname, '..', 'entry/client.js'),
    output: {
      publicPath: '/',
      path: path.resolve(process.cwd(), 'dist', 'public'),
      filename: '[name].[hash].js'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'style.css'
      }),

      // new webpack.optimize.OccurenceOrderPlugin(),
      // new webpack.NoErrorsPlugin(),
      new HtmlWebPackPlugin({
        template: path.resolve(__dirname, '..', 'entry/index.html')
      })
    ]
  },
  config.webpack ? require(path.resolve(config.path, config.webpack)) : {}
)
