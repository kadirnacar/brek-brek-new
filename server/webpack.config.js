const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
module.exports = {
  entry: {
    server: ['./src/index.ts'],
  },
  watch: true,
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: '[name].js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
        include: /src/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@connectionManager': path.resolve(__dirname, 'src/connectionManager'),
      '@dbReader': path.resolve(__dirname, 'src/dbReader'),
      '@models': path.resolve(__dirname, 'src/models'),
      '@routes': path.resolve(__dirname, 'src/routes'),
      '@repository': path.resolve(__dirname, 'src/repository'),
      '@services': path.resolve(__dirname, 'src/services'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@tools': path.resolve(__dirname, 'src/tools'),
      '@database': path.resolve(__dirname, 'src/database/LowDb'),
    },
    fallback: {
      fs: false,
      tls: false,
      net: false,
      path: false,
      zlib: false,
      http: false,
      https: false,
      stream: false,
      crypto: false,
      'crypto-browserify': require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify
    },
  },
  externals: [
    nodeExternals({
      // whitelist: ['webpack/hot/poll?100'],
    }),
  ],
  plugins: [new webpack.HotModuleReplacementPlugin(), new NodePolyfillPlugin()],
};
