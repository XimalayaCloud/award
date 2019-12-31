/**
 * 启动开发模式
 *
 */
const { spawn } = require('child_process');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');
const tsc = path.join(
  __dirname,
  '..',
  '..',
  'node_modules',
  '.bin',
  os.type() === 'Windows_NT' ? 'tsc.cmd' : 'tsc'
);
const watch = require('./watch');
const clean = require('../shared/clean');
const dirs = fs
  .readdirSync(path.join(__dirname, '..', '..', 'packages'))
  .map(item => 'packages/' + item);
const dir = process.cwd();

(async () => {
  let i = 0;
  clean(path.join(__dirname, '..', '..', 'dist'));
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
  watch();
  spawn(tsc, ['-w', '--pretty', '--sourceMap', '--listEmittedFiles'], {
    cwd: dir,
    stdio: 'inherit'
  });
})();
