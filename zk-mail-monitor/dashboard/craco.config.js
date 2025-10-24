const path = require('path');
const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // ✅ Remove CRA import restriction
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ModuleScopePlugin'
      );

      // ✅ Ensure .ts from sibling folders are compiled
      webpackConfig.module.rules.push({
        test: /\.[jt]sx?$/,
        include: [
          path.resolve(__dirname, 'src'),
          path.resolve(__dirname, '../analyzer/src'),
          path.resolve(__dirname, '../mailchain-service/src'),
          path.resolve(__dirname, '../reputation-engine/src'),
        ],
        use: require.resolve('babel-loader'),
      });

      // ✅ Polyfills for Node built-ins
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        buffer: require.resolve('buffer/'),
        assert: require.resolve('assert/'),
        process: require.resolve('process/browser.js'),
      };

      webpackConfig.plugins.push(
        new webpack.ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
          process: 'process/browser',
        })
      );

      // ✅ Proper absolute aliases
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@analyzer': path.resolve(__dirname, '../analyzer/src'),
        '@mailchain-service': path.resolve(__dirname, '../mailchain-service/src'),
        '@reputation-engine': path.resolve(__dirname, '../reputation-engine/src'),
      };

      return webpackConfig;
    },
  },
};
