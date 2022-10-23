/* global process */

import Path from 'node:path';

const isProduction = (process.env.NODE_ENV === 'production');

const config = {
  entry:    './lib/index.js',
  devtool:  'source-map',
  output:   {
    path:               Path.resolve('./dist'),
    scriptType:         'module',
    filename:           'index.js',
    sourceMapFilename:  'index.js.map',
    libraryTarget:      'module',
  },
  plugins: [
    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
  },
  experiments: {
    outputModule: true,
  },
};

export default () => {
  if (isProduction)
    config.mode = 'production';
  else
    config.mode = 'development';

  return config;
};
