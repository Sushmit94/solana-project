// dashboard/config-overrides.js
const webpack = require('webpack');
const path = require('path');

module.exports = function override(config) {
  // Add fallbacks for Node.js core modules
  config.resolve.fallback = {
    ...config.resolve.fallback,
    crypto: require.resolve('crypto-browserify'),
    stream: require.resolve('stream-browserify'),
    buffer: require.resolve('buffer'),
    process: require.resolve('process/browser'),
    vm: require.resolve('vm-browserify'),
    path: require.resolve('path-browserify'),
    os: require.resolve('os-browserify/browser'),
  };

  // Add plugins for polyfills
  config.plugins = [
    ...config.plugins,
    new webpack.ProvidePlugin({
      process: 'process/browser',
      Buffer: ['buffer', 'Buffer'],
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_DEBUG': JSON.stringify(process.env.NODE_DEBUG),
    }),
  ];

  // Ensure proper module resolution
  config.resolve.extensions = [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.json',
    ...config.resolve.extensions,
  ];

  // Add aliases for path imports (matching tsconfig.json paths)
  config.resolve.alias = {
    ...config.resolve.alias,
    '@analyzer': path.resolve(__dirname, '../analyzer/src'),
    '@mailchain-service': path.resolve(__dirname, '../mailchain-service/src'),
    '@reputation-engine': path.resolve(__dirname, '../reputation-engine/src'),
    '@client': path.resolve(__dirname, '../client/src'),
    '@hooks': path.resolve(__dirname, './src/hooks'),
    '@components': path.resolve(__dirname, './src/components'),
  };

  // Add rule for handling .mjs files and resolve .js extensions
  config.module.rules.push({
    test: /\.m?js/,
    resolve: {
      fullySpecified: false,
    },
  });

  // CRITICAL: Add resolve extensions without .js requirement
  config.resolve.extensionAlias = {
    '.js': ['.ts', '.tsx', '.js', '.jsx'],
  };

  // CRITICAL: Remove ModuleScopePlugin to allow imports from outside src/
  const moduleScopePlugin = config.resolve.plugins.find(
    plugin => plugin.constructor && plugin.constructor.name === 'ModuleScopePlugin'
  );
  
  if (moduleScopePlugin) {
    config.resolve.plugins = config.resolve.plugins.filter(
      plugin => plugin.constructor && plugin.constructor.name !== 'ModuleScopePlugin'
    );
  }

  // CRITICAL: Configure babel-loader to handle TypeScript files from parent directories
  const oneOfRule = config.module.rules.find(rule => rule.oneOf);
  
  if (oneOfRule && oneOfRule.oneOf) {
    // Find the existing babel-loader rule for TypeScript
    const tsRule = oneOfRule.oneOf.find(
      rule => rule.test && rule.test.toString().includes('tsx')
    );

    if (tsRule) {
      // Expand include to parent directories
      tsRule.include = [
        path.resolve(__dirname, 'src'),
        path.resolve(__dirname, '../analyzer/src'),
        path.resolve(__dirname, '../mailchain-service/src'),
        path.resolve(__dirname, '../reputation-engine/src'),
        path.resolve(__dirname, '../client/src'),
      ];
    }

    // Add a new rule specifically for TypeScript files in parent directories
    oneOfRule.oneOf.unshift({
      test: /\.(ts|tsx)$/,
      include: [
        path.resolve(__dirname, '../analyzer'),
        path.resolve(__dirname, '../mailchain-service'),
        path.resolve(__dirname, '../reputation-engine'),
        path.resolve(__dirname, '../client'),
      ],
      use: [
        {
          loader: require.resolve('babel-loader'),
          options: {
            presets: [
              require.resolve('@babel/preset-typescript'),
              require.resolve('@babel/preset-react'),
            ],
            plugins: [
              require.resolve('@babel/plugin-proposal-class-properties'),
              require.resolve('@babel/plugin-transform-runtime'),
            ],
          },
        },
      ],
    });
  }

  return config;
};