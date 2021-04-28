const path = require('path');
const webpack = require('webpack');
const NodePolyfillPlugin = require('node-polyfill-webpack-plugin');
const nodeExternals = require('webpack-node-externals');
module.exports = {
  entry: {
    server: ['./server/index.ts'],
  },
  watch: true,
  target: 'node',
  output: {
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    filename: 'server/[name].js',
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
        include: /server/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
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
