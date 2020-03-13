/**
 * 编译dll文件，作为公共资源文件
 */
import * as webpack from 'webpack';
import * as path from 'path';
import FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
import { ProgressBarPlugin } from '../../webpack-plugins';
import { regNodeModules } from '../../help';
import webpackInclude from '../utils/include';
import { BabelConfig } from '../../babel';
import alias from '../utils/alias';

export default (entry: any, dir: string, dllDir: any) => {
  const config = {
    entry,
    context: dir,
    devtool: 'none',
    mode: 'production',
    output: {
      path: path.join(dllDir),
      filename: 'common.js',
      library: 'award_[hash:5]'
    },
    performance: {
      hints: false
    },
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          include: webpackInclude,
          loader: 'babel-loader',
          options: BabelConfig({
            write: false,
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
        'process.env': {
          NODE_ENV: JSON.stringify('production'),
          RUN_ENV: JSON.stringify('web')
        }
      }),
      new webpack.DllPlugin({
        context: dir,
        path: path.join(dllDir, 'manifest.json'),
        name: 'award_[hash:5]'
      }),
      new ProgressBarPlugin({
        format: 'dll Compiling... [:bar] :percent (:elapsed seconds)',
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
