const merge = require("webpack-merge");
const common = require("./common.js")("production");
const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const webpack = require("webpack");
const CleanWebpackPlugin = require("clean-webpack-plugin");
const HtmlWebPackPlugin = require("html-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
//const ManifestPlugin = require("webpack-manifest-plugin");

// gzip compression
const CompressionPlugin = require("compression-webpack-plugin");
//const zopfli = require("@gfx/zopfli");

// br compression
//const BrotliPlugin = require("brotli-webpack-plugin");
// const FaviconsWebpackPlugin = require('favicons-webpack-plugin')

module.exports = merge(common, {
  mode: "production",
  devtool: "source-map",
  entry: path.resolve(__dirname, "..", "entry/client.js"),
  output: {
    publicPath: "/",
    path: path.resolve(process.cwd(), "dist"),
    filename: "[name].bundle.js"
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "style.css"
    }),

    // Delete dist folder before every build
    new CleanWebpackPlugin("dist", {
      root: process.cwd(),
      dry: false
    }),

    // Export html-file to dist/template.html
    new HtmlWebPackPlugin({
      template: "../entry/index.html"
    }),

    // Generate a webpack-manifest of all exported assets
    //new ManifestPlugin({ fileName: "manifest.json" }),

    // General options for loaders
    new webpack.LoaderOptionsPlugin({
      // Switch loaders to `minimize mode` where possible
      minimize: true,

      // Turn off `debug mode` where possible
      debug: false,
      options: {
        // The 'context' that our loaders will use as the root folder
        context: __dirname,

        // image-webpack-loader image crunching options
        imageWebpackLoader: {
          mozjpeg: {
            quality: 65
          },
          pngquant: {
            quality: "65-90",
            speed: 4
          },
          svgo: {
            plugins: [
              {
                removeViewBox: false
              },
              {
                removeEmptyAttrs: false
              }
            ]
          }
        }
      }
    }),

    // Minify and optimize CSS
    new OptimizeCssAssetsPlugin({
      assetNameRegExp: /\.optimize\.css$/g,
      cssProcessor: require("cssnano"),
      cssProcessorOptions: { discardComments: { removeAll: true } },
      canPrint: true
    })
    // Compress assets into .gz files, for browsers with support
    // new CompressionPlugin({
    //   compressionOptions: {
    //     numiterations: 15
    //   },
    //   algorithm(input, compressionOptions, callback) {
    //     return zopfli.gzip(input, compressionOptions, callback);
    //   }
    // })

    // Also generate .br files, with Brotli compression-- often significantly smaller than the gzip equivalent, but not yet universally supported
    //new BrotliPlugin()
    // new FaviconsWebpackPlugin('./src/assets/images/large-icon.png')
  ],
  optimization: {
    splitChunks: {
      chunks: "all"
    },
    minimizer: [
      new UglifyJsPlugin({
        cache: true,
        parallel: true,
        sourceMap: true // set to true if you want JS source maps
      }),
      new OptimizeCssAssetsPlugin({})
    ]
  }
});
