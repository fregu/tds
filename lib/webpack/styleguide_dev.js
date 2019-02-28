const merge = require("webpack-merge");
const common = require("./common.js")("development");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = merge(common, {
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist"
  },
  output: {
    publicPath: "/"
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "styleguide.css"
    }),
    new HtmlWebPackPlugin({
      template: "./kit/entry/index.html"
    })
  ]
});
