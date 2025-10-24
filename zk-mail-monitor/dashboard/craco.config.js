const path = require('path');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // ✅ Disable CRA's restriction on imports outside "src"
      webpackConfig.resolve.plugins = webpackConfig.resolve.plugins.filter(
        (plugin) => plugin.constructor.name !== 'ModuleScopePlugin'
      );

      // ✅ Add aliases for all your external packages
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@reputation-engine': path.resolve(__dirname, '../reputation-engine/src'),
        '@analyzer': path.resolve(__dirname, '../analyzer/src'),
        '@mailchain-service': path.resolve(__dirname, '../mailchain-service/src'),
        '@client': path.resolve(__dirname, '../client/src'),
      };

      return webpackConfig;
    },
  },
};
