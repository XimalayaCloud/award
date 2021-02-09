import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import chalk = require('chalk');
import openBrowser = require('open-chrome-refresh');
import { getAwardConfig } from 'award-utils/server';

import render from './render';

import web_spa from '../build/web_spa';
import { WS } from '../../tools/server';
import { clearConsole, clean } from '../../tools/tool';
import createPort from './utils/createPort';

const cwd = process.cwd();

/**
 * 执行导出包的编译
 */
const start = (options: any, port?: number) => {
  return new Promise(async (resolve) => {
    clearConsole();
    const config = getAwardConfig();
    let assetPrefixs = config.assetPrefixs;
    if (options.local || options.browser) {
      assetPrefixs = './';
      process.env.ROUTER = 'hash';
    }
    process.env.Browser = options.browser ? '1' : '0';
    process.env.NODE_ENV =
      process.env.NODE_ENV || (options.browser || options.local ? 'test' : 'production');
    await web_spa(assetPrefixs);
    await render(assetPrefixs, port);
    resolve(null);
  });
};

export default async (options: any) => {
  try {
    const config = getAwardConfig();
    const Dest = path.join(cwd, config.export_dist, 'dest');

    let port1: any = null;
    let port2: any = null;
    if (options.browser) {
      const ports = await createPort();
      port1 = ports[0];
      port2 = ports[1];
    }

    await start(options, port1);

    if (options.browser) {
      await new Promise((resolve) => {
        new WS(port1, port2)
          .start()
          .then(() => {
            clearConsole();
            console.log('单页应用本地预览模式启动成功...');
            resolve(null);
          })
          .catch((err: any) => {
            console.error(err);
            process.exit(-1);
          });
      });
      let htmlName = 'index.html';
      let urlPath = '/';
      if (
        config.exportPath &&
        !Array.isArray(config.exportPath) &&
        Object.keys(config.exportPath).length
      ) {
        htmlName = Object.keys(config.exportPath)[0];
        urlPath = config.exportPath[htmlName];
      }

      let dir = path.join(cwd, config.export_dist, htmlName);

      if (os.type() === 'Windows_NT') {
        dir = '/' + dir.replace(/\\/g, '/');
      }

      console.info(`浏览器访问：${chalk.yellow('file://' + dir + '#' + urlPath)}`);
      if (os.type() !== 'Windows_NT') {
        process.nextTick(() => {
          openBrowser('file://' + dir);
        });
      }
    }

    const tmpDest = path.join(cwd, 'node_modules', '.award_dest');
    const out = path.join(cwd, config.export_dist);
    clean(tmpDest);
    fs.moveSync(Dest, tmpDest);
    clean(out);
    fs.moveSync(tmpDest, out);
    clean(tmpDest);
    if (!options.browser) {
      process.exit(0);
    }
  } catch (error) {
    console.info('export error', error);
    process.exit(-1);
  }
};
