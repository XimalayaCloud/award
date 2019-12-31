/**
 * tsc编译到dist
 * 移到每个packages下面
 */
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk');
const { spawn } = require('child_process');
const clean = require('../../shared/clean');

const run = (shellInfo, cwd = process.cwd()) =>
  new Promise(resolve => {
    const _shellInfo = shellInfo.split(' ');
    const scriptProcess = spawn(_shellInfo.shift(), _shellInfo, {
      stdio: 'inherit',
      cwd
    });
    scriptProcess.on('close', () => {
      resolve();
    });
  });

const childProcessPrettier = file =>
  new Promise(resolve => {
    const pre = spawn('node', [path.join(__dirname, 'start.js')], {
      stdio: [null, null, null, 'ipc']
    });

    pre.send(file);

    pre.on('exit', resolve);
  });

const stream = process.stdout;
const enabled = stream && stream.isTTY;

const noMove = ['award-types', 'eslint-config-award'];

const move = async name => {
  const distPkgs = path.join(__dirname, '..', '..', '..', 'dist', name);
  if (fs.existsSync(distPkgs)) {
    const pkgs = fs.readdirSync(distPkgs);
    let i = pkgs.length;
    let j = 0;
    while (j < i) {
      const item = pkgs[j];
      if (noMove.indexOf(item) === -1) {
        const curLib = path.join(distPkgs, item, 'src');
        const lib = path.join(__dirname, '..', '..', '..', name, item, 'lib');
        if (fs.existsSync(curLib)) {
          let time = null;
          if (enabled) {
            const curT = `移动 ${chalk.yellow(item)}`;
            const total = 28;
            const min = total - curT.length;
            const start = `${curT}${Array.from(Array(min < 1 ? 1 : min))
              .map(item => ' ')
              .join('')}`;
            stream.write(start);
            time = setInterval(() => {
              stream.write(`=`);
            }, 100);
          }
          clean(lib);
          await run(`mv ${curLib} ${lib}`);
          await childProcessPrettier(`${lib}/**/*.js`);

          if (time && enabled) {
            stream.write(` ✔️\n`);
            clearInterval(time);
          }
        }
      }
      j++;
    }
  }
};

module.exports = async () => {
  await move('packages');
};
