import * as webpack from 'webpack';
import * as fs from 'fs';
import * as path from 'path';
import FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
import ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
import ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');
import chalk = require('chalk');

import { HmrTimePlugin, ProgressBarPlugin, ReactLoadablePlugin } from '../../webpack-plugins';
import { BabelConfig } from '../../babel';

import webpackInclude from '../utils/include';
import alias from '../utils/alias';

import toolConstant from '../../tool/constant';
import { constant, regNodeModules } from '../../help';

const cwd = process.cwd();

const eslintrcConfigFile = path.join(cwd, '.eslintrc.js');
let existEslintrcIgnoreFile = false;
const existEslintrcFile = fs.existsSync(eslintrcConfigFile);

if (fs.existsSync(path.join(cwd, '.eslintignore'))) {
  existEslintrcIgnoreFile = true;
}

export default (entry: string, assetPrefixs: string): webpack.Configuration => {
  const ts = /\.tsx?$/.test(entry);
  const hotReactDOM = path.join(cwd, 'node_modules', '@hot-loader/react-dom');
  const config: webpack.Configuration = {
    // devtool: 'cheap-module-eval-source-map',
    devtool: 'source-map',
    entry: [
      path.join(__dirname, '..', 'utils', 'style-hmr'),
      'react-hot-loader/patch',
      `webpack-hot-middleware/client?path=/award_dev_static/_award/webpack-hmr&timeout=2000&quiet=false&reload=true&overlay=false`,
      entry
    ],
    output: {
      filename: 'award.js',
      publicPath: assetPrefixs
    },
    mode: 'development',
    module: {
      rules: [
        {
          test: /\.(j|t)sx?$/,
          include: webpackInclude,
          use: [
            {
              loader: 'babel-loader',
              options: BabelConfig({
                write: false,
                assetPrefixs
              })
            }
          ]
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          NODE_ENV: JSON.stringify('development'),
          RUN_ENV: JSON.stringify('web'),
          ROUTER: JSON.stringify(process.env.ROUTER)
        }
      }),
      new ProgressBarPlugin({
        format: `${chalk.bgMagenta.white('', 'BUILD', '')} [:bar] :percent (:elapsed seconds)`,
        clear: false,
        width: 60
      }),
      new FriendlyErrorsWebpackPlugin({
        onErrors: function (severity, errors) {
          if (severity !== 'error') {
            return;
          }
          const error: any = errors[0];
          if (error) {
            if (!error.module) {
              const message = error.webpackError?.message ? error.webpackError.message : error.name;
              console.info(message);
            }
          }
        }
      }),
      new ReactLoadablePlugin({
        filename: path.join(toolConstant.CACHE_DIR, constant['REACT-LOADABEL'])
      }),
      new HmrTimePlugin(),
      new webpack.HotModuleReplacementPlugin()
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        ...alias,
        'react-dom': fs.existsSync(hotReactDOM) ? hotReactDOM : '@hot-loader/react-dom'
      }
    }
  };

  /**
   * 分析项目根目录，是否存在.eslintrc.js文件
   * 若存在，则自动开启eslint-loader，否则不开启
   */
  if (existEslintrcFile && config.module) {
    config.module.rules.push({
      enforce: 'pre',
      test: /\.(j|t)sx?$/,
      ...(existEslintrcIgnoreFile
        ? {}
        : {
            exclude: [regNodeModules, /mock/]
          }),
      include: cwd,
      use: [
        {
          loader: 'eslint-loader',
          options: {
            cache: true,
            emitError: true,
            configFile: eslintrcConfigFile
          }
        }
      ]
    });
  }

  if (ts && config.plugins) {
    config.plugins.unshift(
      new ForkTsCheckerWebpackPlugin(),
      new ForkTsCheckerNotifierWebpackPlugin({ title: 'TypeScript', excludeWarnings: false })
    );
  }
  const dllManifest = path.join(cwd, 'node_modules', '.award_dll/manifest.json');
  if (fs.existsSync(dllManifest) && config.plugins) {
    config.plugins.push(
      new webpack.DllReferencePlugin({
        context: '.',
        manifest: require(dllManifest)
      })
    );
  }
  return config;
};
