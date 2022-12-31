/* global process */

import Path from 'node:path';
import TerserPlugin from 'terser-webpack-plugin';

const isProduction = (process.env.NODE_ENV === 'production');

const config = {
  entry:    './lib/index.js',
  devtool:  (isProduction) ? 'source-map' : 'inline-source-map',
  mode:     'production',
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
  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel:       true,
        terserOptions:  {
          keep_classnames:  true,
          keep_fnames:      true,
          ecma:             2015,
          module:           true,
        },
      }),
    ],
  },
};

export default () => {
  if (isProduction)
    config.mode = 'production';
  else
    config.mode = 'development';

  return config;
};
