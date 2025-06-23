const webpack = require('webpack');

module.exports = {
  webpack: {
    configure: (config) => {
      config.resolve.fallback = {
        fs: false,
        path: require.resolve('path-browserify'),
        buffer: require.resolve('buffer/'),
        process: require.resolve('process/browser'),
        stream: require.resolve('stream-browserify'),
        util: require.resolve('util/'),
      };
      config.plugins.push(
        new webpack.ProvidePlugin({
          process: 'process/browser',
          Buffer: ['buffer', 'Buffer'],
        })
      );
      return config;
    },
  },
};
