/**
 * 通过子进程来解析路由，获取路由信息
 */
import { BabelConfig } from '../../../babel';
import { getAwardConfig } from 'award-utils/server';
import webpack = require('webpack');
import * as path from 'path';
import MemoryFileSystem = require('memory-fs');
import FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
import { regNodeModules } from '../../../help';
import prepare from '../../../tool/prepare';

prepare(false, false);

const start = () => {
  const dir: any = process.cwd();
  const { entry } = getAwardConfig(dir);

  const compiler = webpack({
    entry: path.join(dir, entry),
    mode: 'none',
    module: {
      rules: [
        {
          test: /\.(t|j)sx?$/,
          exclude: regNodeModules,
          loader: 'babel-loader',
          include: dir,
          options: BabelConfig({
            write: false,
            isServer: true,
            handleStyle: false,
            subprocess: true
          })
        },
        {
          test: /\.tsx?$/,
          exclude: regNodeModules,
          include: dir,
          loader: 'ts-loader',
          options: {
            transpileOnly: true
          }
        },
        {
          test: /\.(css|scss|less|png|jpg|jpeg|gif|svg|woff|woff2|eot|ttf)!?$/,
          loader: 'ignore-loader'
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin({
        'process.env': {
          RUN_ENV: JSON.stringify('web')
        }
      }),
      new FriendlyErrorsWebpackPlugin()
    ],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
  });

  // 使用内存文件系统
  compiler.outputFileSystem = new MemoryFileSystem();

  compiler.run(() => {});
};

start();
