const { defineConfig } = require('@vue/cli-service');
const webpack = require('webpack');

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
      }),
    ],
    resolve: {
      // modules: [...],
      fallback: {
        buffer: require.resolve('buffer'),
        //   fs: false,
        //   tls: false,
        //   net: false,
        //   path: false,
        //   zlib: false,
        //   http: false,
        //   https: false,
        //   stream: false,
        //   util: false,
        //   crypto: require.resolve('crypto-browserify'),
        //   'crypto-browserify': require.resolve('crypto-browserify'), //if you want to use this module also don't forget npm i crypto-browserify
      },
    },
  },
});
