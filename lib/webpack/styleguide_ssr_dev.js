const merge = require('webpack-merge')
const server = require('./server_dev.js')
const path = require('path')

module.exports = merge(server, {
  entry: path.resolve(__dirname, '..', 'entry/styleguide_ssr.js'),
  output: {
    publicPath: '/',
    path: path.resolve(process.cwd(), 'dist'),
    library: 'ssr',
    libraryTarget: 'umd', // export as importable UMD-module
    filename: 'styleguide_ssr.js'
  }
})
