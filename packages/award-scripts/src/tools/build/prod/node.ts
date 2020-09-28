import * as webpack from 'webpack';
import * as fs from 'fs-extra';
import { join } from 'path';
import * as chalk from 'chalk';
import { getAwardConfig, Constant } from 'award-utils/server';
import { clean, complierInfo } from '../../tool';
import webpackCompiler from '../utils/webpack.compiler';
import WebpackNodeServer from '../webpack/node.server';
import WebpackNodeProject from '../webpack/node.projectConfig';

function Compiler(compiler: webpack.Compiler): Promise<undefined> {
  return new Promise((resolve, reject) => {
    // 编译完成触发
    const name = 'CompilerNode';
    compiler.hooks.done.tap(name, stats => {
      if (stats.compilation.errors && stats.compilation.errors.length) {
        reject();
      }
    });
    compiler.hooks.thisCompilation.tap(name, (compilation: any) => {
      compilation.hooks.beforeChunks.tap(name, () => {
        console.info(chalk.yellow('正在整理文件中...'));
      });
    });
    compiler.hooks.emit.tapAsync(name, (compilation: any, callback: any) => {
      delete compilation.assets[compilation.outputOptions.filename];
      callback();
    });
    compiler.hooks.afterEmit.tapAsync(name, () => {
      resolve();
    });
    // 开始执行编译
    compiler.run(() => {});
  });
}

// 编译服务端代码
export default async (dir: string) => {
  let resetStore: any = null;
  try {
    const config = getAwardConfig(dir);
    const output = join(dir, config.server_dist);

    // 只有当服务端渲染时，才编译node环境需要的资源
    if (config.mode === 'server') {
      complierInfo('Compiling Project Files...');

      const awardConfigTmp = join(dir, 'node_modules', '.awardConfigTmp');
      clean(awardConfigTmp);

      /**
       * 保存配置文件
       */
      const awardConfig = join(output, '.awardConfig');
      let existawardConfig = false;
      if (fs.existsSync(awardConfig)) {
        fs.moveSync(awardConfig, awardConfigTmp);
        existawardConfig = true;
      }

      resetStore = () => {
        // 删除所有编译代码
        clean(output);
        if (existawardConfig && fs.existsSync(awardConfigTmp)) {
          // 如果之前存在配置文件，则恢复
          fs.mkdirSync(output);
          fs.moveSync(awardConfigTmp, awardConfig);
        }
      };

      process.on('SIGINT', () => {
        resetStore();
        process.exit(-1);
      });

      clean(output);

      // 将项目资源编译为node环境运行
      await Compiler(
        await webpackCompiler(
          config.webpack,
          WebpackNodeProject({
            entry: join(dir, config.entry),
            output,
            dir,
            assetPrefixs: config.assetPrefixs
          }),
          {
            isServer: true,
            isAward: true,
            dev: false,
            dir
          }
        )
      );

      // 复制转移的配置map文件和图片映射资源表
      if (existawardConfig) {
        fs.moveSync(awardConfigTmp, awardConfig);
      }
      const awardImageCache = join(dir, 'node_modules', Constant.IAMGECACHENAME);
      if (fs.existsSync(awardImageCache)) {
        fs.moveSync(awardImageCache, join(output, Constant.IAMGECACHENAME));
      }
    }

    const nodeEntry = [];
    // 判断document.(js|ts|tsx|jsx)是否存在
    ['.ts', '.tsx', '.js', '.jsx'].forEach((item: any) => {
      const docFile = join(dir, 'document' + item);
      if (fs.existsSync(docFile)) {
        nodeEntry.push(docFile);
      }
    });

    const configPath = join(dir, 'award.config.js');
    if (fs.existsSync(configPath)) {
      nodeEntry.push(configPath);
    }
    if (nodeEntry.length) {
      // 编译纯node资源
      complierInfo('Compiling NodeJS Files...');
      await Compiler(
        await webpackCompiler(
          config.webpack,
          WebpackNodeServer({
            entry: nodeEntry,
            output,
            dir,
            assetPrefixs: config.assetPrefixs
          }),
          {
            isServer: true,
            isAward: false,
            dev: false,
            dir
          }
        )
      );
    }
  } catch (e) {
    if (e) {
      console.error(e);
    }
    if (resetStore) {
      await resetStore();
    }
    process.exit(-1);
  }
};
