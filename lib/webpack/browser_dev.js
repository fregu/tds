const merge = require('webpack-merge')
const common = require('./common.js')('development')
// const webpack = require("webpack");
const config = require('../config')()
const HtmlWebPackPlugin = require('html-webpack-plugin')
const path = require('path')
// const BrowserSyncPlugin = require("browser-sync-webpack-plugin");
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

module.exports = merge(
  common,
  {
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
      contentBase: './dist',
      hot: true
    },
    entry: path.resolve(__dirname, '..', 'entry/client.js'),
    output: {
      publicPath: '/',
      path: path.resolve(process.cwd(), 'dist'),
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
      // Hijack webpack-dev-server on port 8080 and proxy it though port 3000
      // new BrowserSyncPlugin({
      //   open: false,
      //   host: "localhost",
      //   port: 3000,
      //   proxy: "http://localhost:9080"
      // })
    ]
  },
  config.webpack ? require(path.resolve(config.path, config.webpack)) : {}
)
