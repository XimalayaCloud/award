import chalk = require('chalk');
import * as webpack from 'webpack';
import * as fs from 'fs';
import * as path from 'path';
import { BabelConfig } from '../../babel';
import { constant, regNodeModules } from '../../help';
import FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
import { HmrTimePlugin, ProgressBarPlugin, ReactLoadablePlugin } from '../../webpack-plugins';
import webpackInclude from '../utils/include';
import alias from '../utils/alias';

const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ForkTsCheckerNotifierWebpackPlugin = require('fork-ts-checker-notifier-webpack-plugin');

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
    devtool: 'cheap-module-eval-source-map',
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
        },
        {
          test: /\.tsx?$/,
          include: webpackInclude,
          use: [
            {
              loader: 'ts-loader',
              options: {
                transpileOnly: true
              }
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
      new FriendlyErrorsWebpackPlugin(),
      new ReactLoadablePlugin({
        filename: path.join(cwd, 'node_modules/.cache/award/' + constant['REACT-LOADABEL'])
      }),
      new HmrTimePlugin(),
      new webpack.HotModuleReplacementPlugin(),
      new webpack.NoEmitOnErrorsPlugin()
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        ...alias,
        'react-dom': fs.existsSync(hotReactDOM) ? hotReactDOM : '@hot-loader/react-dom'
      }
    }
  };

  if (existEslintrcFile && config.module) {
    config.module.rules.push({
      test: /\.(jsx?|tsx?)$/,
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
            emitWarning: true,
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
