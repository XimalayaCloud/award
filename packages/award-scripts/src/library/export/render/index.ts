/**
 * 启动子进程来执行路由解析工作
 */
import { spawn } from 'child_process';
import { join } from 'path';
import chalk = require('chalk');
import { clearConsole } from '../../../tools/tool';

export default (assetPrefixs: string, port?: number) =>
  new Promise(resolve => {
    clearConsole();
    console.info(`${chalk.bgBlue.white('', 'WAIT', '')} ${chalk.white('正在导出html...')}`);
    const child = spawn(
      'node',
      [
        ...(process.env.AWARD_DEBUG ? ['--inspect=127.0.0.1:12340'] : []),
        join(__dirname, './export.js'),
        assetPrefixs,
        ...(port ? [String(port)] : [])
      ],
      {
        cwd: process.cwd(),
        stdio: 'inherit'
      }
    );

    child.on('exit', code => {
      if (code === 0) {
        resolve();
      } else {
        process.exit(-1);
      }
    });
  });
