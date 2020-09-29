/**
 * 纯node环境代码编译
 *
 * 即构建类似award.config.js和document.js的文件
 */
import { join } from 'path';
import { BabelConfig } from '../../babel';
import FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
import { regNodeModules } from '../../help';
import prefix from '../utils/prefix';

let num = 1;

export default function nodeConfig({
  entry,
  output,
  dir,
  assetPrefixs
}: {
  entry: any;
  output: string;
  dir: string;
  assetPrefixs: string;
}): any {
  return {
    context: dir,
    devtool: 'none',
    entry,
    output: {
      path: output,
      filename: 'award.js'
    },
    mode: 'production',
    target: 'node',
    externals: [
      (context: string, request: string, callback: Function) => {
        if (regNodeModules.test(context)) {
          return callback(null, 'commonjs ' + request);
        }
        callback();
      }
    ],
    module: {
      rules: [
        {
          test: /\.(jsx?|tsx?|json)$/,
          exclude: regNodeModules,
          include: dir,
          loader: 'emit-file-loader',
          options: {
            name: '[path][name].[ext]',
            pwd: dir,
            transform({
              content,
              interpolatedName
            }: {
              content: string;
              interpolatedName: string;
            }) {
              console.info(`[${prefix(String(num), 2)}]编译文件`, interpolatedName);
              num++;
              return {
                content,
                sourceMap: false
              };
            }
          }
        },
        {
          test: /\.(j|t)sx?$/,
          exclude: regNodeModules,
          include: dir,
          loader: 'babel-loader',
          options: BabelConfig({
            write: false,
            isServer: true,
            assetPrefixs
          })
        }
      ]
    },
    plugins: [new FriendlyErrorsWebpackPlugin()],
    resolveLoader: {
      modules: ['node_modules', join(__dirname, 'loaders')],
      extensions: ['.js', '.ts']
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
  };
}
