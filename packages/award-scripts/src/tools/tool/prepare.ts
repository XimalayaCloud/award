/**
 * 开发及构建环境启动时的准备工作
 */
import * as os from 'os';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as Event from 'events';
import createProjectFileHash from './createProjectFileHash';
import compiler from '../compiler';
import portIsOccupied from './port';

let start = false;

global.EventEmitter = new Event();

export default (register = true, showInfo = true, port?: number) => {
  try {
    if (port) {
      // 判断端口是否冲突
      portIsOccupied(port);
    }

    // 创建cache文件夹
    const cache = path.join(process.cwd(), 'node_modules', '.cache', 'award');

    if (!fs.existsSync(cache)) {
      fs.mkdirpSync(cache);
    }

    const argvs = process.argv.slice(2);
    process.env.RUN_ENV = 'node';

    if (showInfo) {
      // 提示当前的award、award-scripts版本
      const { version: award_V } = require('award/package.json');
      const { version: award_scripts_V } = require('award-scripts/package.json');
      console.info();
      if (os.type() === 'Windows_NT') {
        console.info('当前框架版本');
      } else {
        console.info(' 💅  当前框架版本');
      }
      console.info();
      console.info(' ' + chalk.bgGreen.black(' award ') + ' ' + chalk.yellow(award_V));
      console.info();
      console.info(
        ' ' + chalk.bgGreen.black(' award-scripts ') + ' ' + chalk.yellow(award_scripts_V)
      );

      console.info();
      if (os.type() === 'Windows_NT') {
        console.info('正在筹备中...');
      } else {
        console.info(' 🚚  正在筹备中...');
      }
      console.info();
    }

    // 环境变量
    process.env.AWARD_COMPILER = 'true';

    // source-map提示
    require('source-map-support').install();

    if (argvs[0] === 'dev') {
      process.env.NODE_ENV = process.env.NODE_ENV || 'development';
      start = true;
    }
    if (start) {
      if (!process.env.CHILDPROCESS_COMPILER_URL) {
        require('./random_host')();
      }
      compiler();
    }

    // 入口的babel-register，支持配置文件es6
    require('../babel').EntryRegister();
    // check配置是否正确
    require('../tool').checkConfig(false);

    if (register) {
      // 注册插件
      require('award-utils/server').registerPlugin();
      createProjectFileHash();
    }
  } catch (error) {
    console.error(error);
    process.exit(-1);
  }
};
