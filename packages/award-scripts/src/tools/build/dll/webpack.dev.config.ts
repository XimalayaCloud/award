/**
 * 编译开发环境dll文件，作为公共资源文件
 */
import * as webpack from 'webpack';
import * as path from 'path';
import { BabelConfig } from '../../babel';
import FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
import { ProgressBarPlugin } from '../../webpack-plugins';
import webpackInclude from '../utils/include';
import alias from '../utils/alias';

export default (entry: any, dir: string, assetPrefixs: string, envs: any, dllDir: any) => {
  const config = {
    entry,
    context: dir,
    performance: {
      hints: false
    },
    devtool: 'none',
    mode: 'development',
    output: {
      path: dllDir,
      filename: 'common.js',
      library: 'award_[hash:5]',
      publicPath: assetPrefixs
    },
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          include: webpackInclude,
          loader: 'babel-loader',
          options: BabelConfig({
            write: false,
            dll: true,
            assetPrefixs
          })
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': envs
      }),
      new webpack.DllPlugin({
        context: dir,
        path: path.join(dllDir, 'manifest.json'),
        name: 'award_[hash:5]'
      }),
      new ProgressBarPlugin({
        format: 'dll-dev Compiling... [:bar] :percent (:elapsed seconds)',
        clear: false,
        width: 60
      }),
      new FriendlyErrorsWebpackPlugin()
    ],
    resolve: {
      alias
    }
  };

  if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
      new webpack.optimize.OccurrenceOrderPlugin(true),
      new webpack.optimize.ModuleConcatenationPlugin()
    );
  }

  return config;
};
