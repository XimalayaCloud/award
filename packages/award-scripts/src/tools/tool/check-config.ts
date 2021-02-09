/* eslint-disable max-depth */
import * as fs from 'fs';
import * as _ from 'lodash';
import { join } from 'path';
import chalk = require('chalk');
import clearConsole from './clearConsole';
import { getAwardConfig } from 'award-utils/server';

const dir = process.cwd();

const example = () => {
  console.info(`🤗  配置文件示例`);
  console.info(chalk.yellow('module.exports = {'));
  console.info(chalk.yellow('  entry: "./index.js"'));
  console.info(chalk.yellow('}'));
  console.info();
};

// eslint-disable-next-line complexity
const judgeEntry = () => {
  const defaultEntryjs = join(dir, 'index.js');
  const defaultEntryjsx = join(dir, 'index.jsx');
  const defaultEntryts = join(dir, 'index.ts');
  const defaultEntrytsx = join(dir, 'index.tsx');
  const configDir = join(dir, 'award.config.js');

  // 判断默认入口是否存在
  let existEntry = true;
  if (
    !fs.existsSync(defaultEntryjs) &&
    !fs.existsSync(defaultEntryjsx) &&
    !fs.existsSync(defaultEntryts) &&
    !fs.existsSync(defaultEntrytsx)
  ) {
    existEntry = false;
  }

  // 分析入口文件是否存在
  if (!fs.existsSync(configDir)) {
    // 配置不存在
    if (!existEntry) {
      // 默认入口也不存在
      console.info(
        `⚠️  请创建配置文件 ${chalk.yellow(
          'award.config.js'
        )}, 同时在配置文件中指定项目入口地址\n   或者在项目根目录创建 ${chalk.yellow(
          'index.js'
        )} | ${chalk.yellow('index.jsx')} | ${chalk.yellow('index.ts')} | ${chalk.yellow(
          'index.tsx'
        )} 文件作为根目录，这是默认入口`
      );
      console.info();
      example();
      process.exit(-1);
    }
  } else {
    // 配置存在 -- 解析配置信息
    let config = require(configDir);
    config = config.default || config;

    if (!config.entry && !existEntry) {
      console.info(`⚠️  请在配置文件中指定项目的入口地址`);
      console.info();
      example();
      process.exit(-1);
    }

    if (config.entry && !_.isString(config.entry)) {
      console.info(`⚠️  项目入口的数据格式必须为字符串`);
      console.info();
      example();
      process.exit(-1);
    }

    if (config.entry) {
      // 解析配置的入口
      const entry = join(dir, config.entry);
      let sure = false;
      if (/\.(jsx?|tsx?)$/.test(entry)) {
        if (!fs.existsSync(entry)) {
          console.info(`⚠️  项目入口地址  ${entry}  不存在`);
          console.info();
          process.exit(-1);
        }
      } else {
        if (!fs.existsSync(entry)) {
          const entryjs = entry + '.js';
          const entryjsx = entry + '.jsx';
          const entryts = entry + '.ts';
          const entrytsx = entry + '.tsx';

          if (
            !fs.existsSync(entryjs) &&
            !fs.existsSync(entryts) &&
            !fs.existsSync(entrytsx) &&
            !fs.existsSync(entryjsx)
          ) {
            if (!fs.existsSync(entryjs)) {
              console.info(`⚠️  项目入口地址  ${entryjs}  不存在`);
              console.info();
              process.exit(-1);
            } else {
              sure = true;
            }

            if (!fs.existsSync(entryjsx) && !sure) {
              console.info(`⚠️  项目入口地址  ${entryjsx}  不存在`);
              console.info();
              process.exit(-1);
            } else if (fs.existsSync(entryjsx)) {
              sure = true;
            }

            if (!fs.existsSync(entryts) && !sure) {
              console.info(`⚠️  项目入口地址  ${entryts}  不存在`);
              console.info();
              process.exit(-1);
            } else if (fs.existsSync(entryts)) {
              sure = true;
            }

            if (!fs.existsSync(entrytsx) && !sure) {
              console.info(`⚠️  项目入口地址  ${entrytsx}  不存在`);
              console.info();
              process.exit(-1);
            } else if (fs.existsSync(entrytsx)) {
              sure = true;
            }
          }
        }
      }
    }
  }
};

export default (clear = true) => {
  // 解析判断入口
  judgeEntry();

  clear && clearConsole();

  const config = getAwardConfig();

  // 分析 mode、router、hashName 设置的值

  if (config.mode !== 'server' && config.mode !== 'client') {
    // mode配置不对
    console.info(
      `⚠️  配置文件中，mode只接受 ${chalk.yellow('server')} 或者 ${chalk.yellow('client')} 这两个值`
    );
    console.info();
    process.exit(-1);
  }

  if (config.router !== 'browser' && config.router !== 'hash') {
    // router配置不对
    console.info(
      `⚠️  配置文件中，router只接受 ${chalk.yellow('browser')} 或者 ${chalk.yellow(
        'hash'
      )} 这两个值`
    );
    console.info();
    process.exit(-1);
  }

  if (typeof config.hashName !== 'boolean') {
    // hashName配置不对
    console.info(`⚠️  配置文件中，hashName只接受${chalk.yellow('布尔值')}`);
    console.info();
    process.exit(-1);
  }

  // 判断 dist， public, export 都不能为空
  // 为空就表示当前根项目，会把根项目删掉的
  const dir = process.cwd();
  if (join(dir, config.server_dist) === dir) {
    // dist配置不对
    console.info(`⚠️  配置文件中，server_dist不能为空`);
    console.info();
    process.exit(-1);
  }

  if (join(dir, config.client_dist) === dir) {
    // public配置不对
    console.info(`⚠️  配置文件中，client_dist不能为空`);
    console.info();
    process.exit(-1);
  }

  if (join(dir, config.export_dist) === dir) {
    // export配置不对
    console.info(`⚠️  配置文件中，export_dist不能为空`);
    console.info();
    process.exit(-1);
  }

  if (!/\/$/.test(config.assetPrefixs)) {
    console.info(`⚠️  配置文件中，assetPrefixs必须已斜杠结束`);
    console.info();
    process.exit(-1);
  }

  const ts = /\.tsx?$/.test(config.entry);
  const tsConfig = join(dir, 'tsconfig.json');

  if (ts && !fs.existsSync(tsConfig)) {
    console.info('TypeScript项目的配置文件【tsconfig.json】不存在');
    console.info(
      `请点击查看award项目的TS基础配置 https://ximalayacloud.github.io/award/docs/more/tools#tsconfigjson%E9%85%8D%E7%BD%AE`
    );
    console.info();
    process.exit(-1);
  }

  return config;
};
