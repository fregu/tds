const merge = require("webpack-merge");
const common = require("./common.js")("development");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = merge(common, {
  devtool: "inline-source-map",
  devServer: {
    contentBase: "./dist/styleguide"
  },
  output: {
    publicPath: "/styleguide",
    path: path.resolve(process.cwd(), "dist", "styleguide"),
    filename: "styleguide.js"
  },
  plugins: [
    new MiniCssExtractPlugin({
      publicPath: "/styleguide/styleguide.css",
      filename: "styleguide.css"
    })
  ]
});
