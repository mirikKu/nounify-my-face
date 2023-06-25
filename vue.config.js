const { defineConfig } = require('@vue/cli-service');
module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      // modules: [...],
      // fallback: {
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
      // },
    },
  },
});
