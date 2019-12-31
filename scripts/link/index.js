/**
 * install结束后直接link
 */
const path = require('path');
const fs = require('fs-extra');
const os = require('os');
const { spawn } = require('child_process');
const cwd = path.join(__dirname, '..', '..');

const shellName = os.type() === 'Windows_NT' ? 'yarn.cmd' : 'yarn';

const _unlink = release =>
  new Promise(resolve => {
    const yarn = spawn(shellName, ['unlink'], {
      cwd: release
    });

    yarn.stdout.on('data', resolve);
  });

const _link = release =>
  new Promise(resolve => {
    const yarn = spawn(shellName, ['link'], {
      cwd: release
    });

    yarn.stdout.on('data', resolve);
  });

const link_project = (name, project) =>
  new Promise(resolve => {
    const yarn = spawn(shellName, ['link', name], {
      cwd: project
    });

    yarn.stdout.on('data', resolve);
  });

const link = async (project, pkgDir) => {
  const dirs = [];
  pkgDir.forEach(item => {
    fs.readdirSync(item).forEach(pk => {
      dirs.push(path.join(item, pk));
    });
  });

  // 指定link目标
  let index = 0;
  while (dirs.length > index) {
    const item = dirs[index];
    if (fs.statSync(item).isDirectory()) {
      const pkgFile = path.join(item, 'package.json');
      if (fs.existsSync(pkgFile)) {
        const pkg = require(pkgFile);
        const name = pkg.name;

        await _unlink(item);

        await _link(item);

        await link_project(name, project);

        console.log(`yarn link "${name}"`);
      }
    }
    index++;
  }
};

link(path.resolve(cwd), [path.resolve(cwd, 'packages')]);
