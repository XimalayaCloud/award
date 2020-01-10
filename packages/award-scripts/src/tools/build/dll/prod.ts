/**
 * 处理dll文件
 * 默认会缓存在根目录的.dll下
 * 同时每次取值会做hash判断文件是否发生变更，来决定是否重新编译dll资源
 *
  new webpack.DllReferencePlugin({
    context: '.',
    manifest: require(path.join(dir, '.dll/manifest.json'))
  })
 */
import chalk = require('chalk');
import md5 = require('md5');
import * as path from 'path';
import * as fs from 'fs-extra';
import { complierInfo } from '../../tool';
import ProdCompiler from '../utils/prod.compiler';
import webpackCompiler from '../utils/webpack.compiler';
import WebpackConfig from './webpack.prod.config';
import { countDllPkgHash } from './utils';

export default (dir: string, isUseRoute: boolean) => {
  // 需要特殊区分生产环境和其他环境
  let dllDir: any = path.join(dir, '.dll');
  const commonDll = path.join(dllDir, 'common.js');
  const manifestJson = path.join(dllDir, 'manifest.json');
  const dllLockFile = path.join(dllDir, '.lock');

  return new Promise(async (resolve, reject) => {
    try {
      /**
       * 获取packages.json的dll参数
       */
      const dll = require(path.join(dir, 'package.json')).dll || [];
      // 遍历每个entry的版本号
      const entry = [
        ...new Set([
          'react',
          'react-dom',
          'react-helmet',
          'react-loadable',
          'isomorphic-fetch',
          'hoist-non-react-statics',
          'lodash/isString',
          'lodash/reduce',
          'lodash/defaultsDeep',
          'lodash/isString',
          'lodash/some',
          'lodash/forEach',
          'lodash/isNull',
          'lodash/isPlainObject',
          'lodash/isUndefined',
          'lodash/isFunction',
          ...dll
        ])
      ].filter((item: any) => !/^[\.|\/]/.test(item) && !/^award/.test(item));
      if (isUseRoute) {
        entry.push('award-router');
      }
      const entryHash = countDllPkgHash(entry);

      if (
        fs.existsSync(dllDir) &&
        fs.existsSync(commonDll) &&
        fs.existsSync(manifestJson) &&
        fs.existsSync(dllLockFile)
      ) {
        // 验证lock内容是否一致
        const commonDllHash = md5(fs.readFileSync(commonDll, 'utf-8'));
        const manifestJsonHash = md5(fs.readFileSync(manifestJson, 'utf-8'));
        const currentLock = md5(entryHash + commonDllHash + manifestJsonHash);
        const oldLock = fs.readFileSync(dllLockFile, 'utf-8');
        if (currentLock === oldLock) {
          console.info(chalk.yellow(`检测发现当前dll资源未发生变更，将不再编译`));
          return resolve();
        }
      }

      const config: any = WebpackConfig(entry, dir, dllDir);
      complierInfo(`dll entry ${chalk.yellow(entry.toString())}`);
      await ProdCompiler(
        await webpackCompiler(config.webpack, config, {
          isServer: false,
          isAward: false,
          dev: false,
          dir,
          dll: true
        })
      );

      // 创建或者更新lock
      if (fs.existsSync(dllDir) && fs.existsSync(commonDll) && fs.existsSync(manifestJson)) {
        const commonDllHash = md5(fs.readFileSync(commonDll, 'utf-8'));
        const manifestJsonHash = md5(fs.readFileSync(manifestJson, 'utf-8'));
        const currentLock = md5(entryHash + commonDllHash + manifestJsonHash);
        fs.writeFileSync(dllLockFile, currentLock);
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
