/**
 * 编译dll文件，作为公共资源文件
 */
import * as webpack from 'webpack';
import * as path from 'path';
import { BabelConfig } from '../../babel';
import FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
import { ProgressBarPlugin } from '../../webpack-plugins';
import { regNodeModules } from '../../help';
import webpackInclude from '../utils/include';

export default (entry: any, dir: string, assetPrefixs: string, envs: any, dllDir: any) => {
  const config = {
    entry,
    context: dir,
    devtool: 'none',
    performance: {
      hints: false
    },
    mode: process.env.NODE_ENV === 'production' ? 'production' : 'none',
    output: {
      path: path.join(dllDir),
      filename: 'common.js',
      library: '__award_library__',
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
            assetPrefixs,
            handleStyle: false
          })
        },
        {
          test: /\.tsx?$/,
          exclude: regNodeModules,
          include: dir,
          loader: 'ts-loader'
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': envs
      }),
      new webpack.DllPlugin({
        path: path.join(dllDir, 'manifest.json'),
        name: '__award_library__'
      }),
      new ProgressBarPlugin({
        format: 'dll Compiling... [:bar] :percent (:elapsed seconds)',
        clear: false,
        width: 60
      }),
      new FriendlyErrorsWebpackPlugin()
    ]
  };

  if (process.env.NODE_ENV === 'production') {
    config.plugins.push(
      new webpack.optimize.OccurrenceOrderPlugin(true),
      new webpack.optimize.ModuleConcatenationPlugin()
    );
  }

  return config;
};
