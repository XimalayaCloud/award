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
import { getAwardConfig } from 'award-utils/server';
import * as fs from 'fs-extra';
import { complierInfo } from '../../tool';
import ProdCompiler from '../utils/prod.compiler';
import webpackCompiler from '../utils/webpack.compiler';
import WebpackConfig from './webpack.prod.config';

export default (dir: string, assetPrefixs: string, useRoute: boolean) => {
  // 需要特殊区分生产环境和其他环境
  let dllDir: any = null;
  if (process.env.NODE_ENV === 'production') {
    dllDir = path.join(dir, '.dll');
  } else {
    dllDir = path.join(dir, 'node_modules', '.cache', 'award', '.dll');
  }
  const commonDll = path.join(dllDir, 'common.js');
  const manifestJson = path.join(dllDir, 'manifest.json');
  const dllLockFile = path.join(dllDir, '.lock');
  const pkg = path.join(dir, 'package.json');
  const awardConfig = path.join(dir, 'award.config.js');

  let pkgHash = '';
  let awardConfigHash = '';
  if (fs.existsSync(pkg)) {
    pkgHash = md5(String(fs.readFileSync(pkg)));
  }
  if (fs.existsSync(awardConfig)) {
    awardConfigHash = md5(String(fs.readFileSync(awardConfig)));
  }

  return new Promise(async (resolve, reject) => {
    try {
      /**
       * 获取packages.json的dll参数
       */
      const dll = require(path.join(dir, 'package.json')).dll || [];
      if (useRoute) {
        dll.push('award-router');
      }
      let entryHash = '';
      // 遍历每个entry的版本号
      const entry = [
        ...new Set(['react', 'react-dom', 'award', 'award-fetch', 'award-plugin', ...dll])
      ].map((item: any) => {
        if (/\.\//.test(item)) {
          const fullpath = path.resolve(dir, item);
          entryHash += md5(item + fs.readFileSync(fullpath, 'utf-8'));
          return fullpath;
        } else {
          let version = '';
          try {
            version = require(item + '/package.json').version;
          } catch (error) {
            try {
              version = require(path.join(dir, 'node_modules', item, 'package.json')).version;
            } catch (error) {}
          }
          entryHash += md5(item + version);
          return item;
        }
      });
      const { exportPath } = getAwardConfig();
      const envs = {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        RUN_ENV: JSON.stringify('web'),
        WEB_TYPE: JSON.stringify(process.env.WEB_TYPE),
        Browser: JSON.stringify(process.env.Browser),
        ROUTER: JSON.stringify(process.env.ROUTER),
        USE_ROUTE: JSON.stringify(useRoute ? '1' : '0'),
        ...(process.env.EXPORTRUNHTML === '1' ? { EXPORTPATH: JSON.stringify(exportPath) } : {})
      };
      const envsStr = JSON.stringify(envs);

      if (
        fs.existsSync(dllDir) &&
        fs.existsSync(commonDll) &&
        fs.existsSync(manifestJson) &&
        fs.existsSync(dllLockFile)
      ) {
        // 验证lock内容是否一致
        const commonDllTime = fs.statSync(commonDll).ctimeMs;
        const manifestJsonTime = fs.statSync(manifestJson).ctimeMs;
        const commonDllHash = md5(fs.readFileSync(commonDll, 'utf-8'));
        const manifestJsonHash = md5(fs.readFileSync(manifestJson, 'utf-8'));
        const currentLock = md5(
          pkgHash +
            awardConfigHash +
            assetPrefixs +
            envsStr +
            entryHash +
            commonDllTime +
            manifestJsonTime +
            commonDllHash +
            manifestJsonHash
        );
        const oldLock = fs.readFileSync(dllLockFile, 'utf-8');
        if (currentLock === oldLock) {
          console.info(chalk.yellow(`检测发现当前dll资源未发生变更，将不再编译`));
          return resolve();
        }
      }

      const config: any = WebpackConfig(entry, dir, assetPrefixs, envs, dllDir);
      if (useRoute) {
        console.info(`检测发现当前项目${chalk.green(' 已使用 ')}路由，请确认！！！`);
      } else {
        console.info(`检测发现当前项目${chalk.red(' 未使用 ')}路由，请确认！！！`);
      }
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
        const commonDllTime = fs.statSync(commonDll).ctimeMs;
        const manifestJsonTime = fs.statSync(manifestJson).ctimeMs;
        const commonDllHash = md5(fs.readFileSync(commonDll, 'utf-8'));
        const manifestJsonHash = md5(fs.readFileSync(manifestJson, 'utf-8'));
        const currentLock = md5(
          pkgHash +
            awardConfigHash +
            assetPrefixs +
            envsStr +
            entryHash +
            commonDllTime +
            manifestJsonTime +
            commonDllHash +
            manifestJsonHash
        );
        fs.writeFileSync(dllLockFile, currentLock);
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};
