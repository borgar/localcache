/* global __dirname */
const TerserPlugin = require('terser-webpack-plugin');
const path = require('path');

module.exports = {
  entry: './lib/index.js',
  output: {
    library: 'localcache',
    libraryTarget: 'umd',
    libraryExport: 'default',
    filename: './localcache.js',
    globalObject: 'typeof self !== \'undefined\' ? self : this',
    path: path.resolve(__dirname)
  },
  optimization: {
    minimize: true,
    minimizer: [ new TerserPlugin() ]
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
};
