/**
 * 启动开发模式
 *
 */
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs-extra');
const chalk = require('chalk');
const path = require('path');
const tsc = path.join(
  __dirname,
  '..',
  '..',
  'node_modules',
  '.bin',
  os.type() === 'Windows_NT' ? 'tsc.cmd' : 'tsc'
);
const move = require('./move');
const notifier = require('node-notifier');
const clean = require('../shared/clean');

const dirs = fs
  .readdirSync(path.join(__dirname, '..', '..', 'packages'))
  .map(item => 'packages/' + item);

const dir = process.cwd();

const stream = process.stdout;
const enabled = stream && stream.isTTY;

(async () => {
  try {
    let i = 0;
    console.log();
    const info = chalk.yellow('正在编译中...');
    if (enabled) {
      stream.write(info);
    } else {
      console.log(info);
    }
    clean(path.join(dir, 'dist'));
    while (i < dirs.length) {
      const item = dirs[i];
      await new Promise(resolve => {
        const cwd = path.join(dir, item);
        if (fs.existsSync(cwd) && fs.statSync(cwd).isDirectory()) {
          clean(path.join(cwd, 'lib'));
        }
        resolve();
      });
      i++;
    }
    const _tsc = spawn(tsc, {
      cwd: dir
    });
    _tsc.stdout.on('data', data => {
      const content = data.toString();
      console.log();
      console.log(content);
      process.exit(-1);
    });
    _tsc.on('close', async err => {
      const info = chalk.green('编译完成\n');
      if (enabled) {
        stream.clearLine();
        stream.cursorTo(0);
        stream.write(info);
      } else {
        console.log(info);
      }
      console.log();
      await move();
      console.log(chalk.gray('正在移除资源中...'));
      clean(path.join(dir, 'dist'));
      notifier.notify({
        title: 'Award框架编译完成',
        message: '编译完成'
      });
      process.exit();
    });
  } catch (error) {
    console.error(error);
    process.exit(-1);
  }
})();
