import chalk = require('chalk');
import Koa = require('koa');
import { join } from 'path';
import * as fs from 'fs-extra';
import { getAwardConfig } from 'award-utils/server';
import watch from '../../style/watch';
import web from '../webpack/web.dev.config';
import WebpackMiddleware from './webpack-middleware';
import webpackCompiler from '../utils/webpack.compiler';
import { clean } from '../../tool';
import { memoryFile } from '../../help';
import dllDev from '../dll/dev';

// 编译客户端文件
module.exports = function (app: Koa) {
  const dir = process.cwd();
  const config = getAwardConfig();

  process.env.ROUTER = config.router;

  if (config.assetOrigin) {
    config.assetPrefixs = `http://${config.ip}:${process.env.MAIN_PORT}/award_dev_static/`;
  } else {
    config.assetPrefixs = '/award_dev_static/';
  }

  const doneFile = join(dir, 'node_modules', 'compiler.done');

  // 清空缓存
  clean(join(dir, 'node_modules', '.cache', 'babel-loader'));
  clean(doneFile);

  // 开始webpack编译客户端文件
  return new Promise(async (resolve, reject) => {
    // 获取编译对象
    const entry = join(dir, config.entry);
    // 判断是否需要编译dll文件
    await dllDev(config.webpack, dir, config.assetPrefixs);
    try {
      const compiler = await webpackCompiler(config.webpack, web(entry, config.assetPrefixs), {
        isServer: false,
        isAward: true,
        dev: true,
        dir
      });
      compiler.outputFileSystem = memoryFile;

      compiler.hooks.done.tap('done', async (stats: any) => {
        if (stats.compilation.errors.length === 0) {
          fs.writeFileSync(doneFile, '');
        }
      });

      // webpack热更新中间件
      WebpackMiddleware(app, compiler);

      // watch监听样式文件
      watch(compiler, app);

      resolve(null);
    } catch (err) {
      console.error(chalk.red('Failed to compile.'));
      reject(err);
    }
  });
};
