const path = require('path');
const chalk = require('chalk');
const { spawn, execSync } = require('child_process');
const inquirer = require('inquirer');
const os = require('os');
const lernaShell = path.join(
  __dirname,
  '..',
  '..',
  'node_modules',
  '.bin',
  os.type() === 'Windows_NT' ? 'lerna.cmd' : 'lerna'
);

const type = process.argv.splice(2)[0];

const Types = ['alpha', 'beta', 'rc', 'patch'];

if (Types.indexOf(type) === -1) {
  console.log(chalk.yellow('请指定发布类型'));
  process.exit();
}

(async () => {
  execSync('npm get registry', {
    stdio: 'inherit'
  });
  await new Promise(resolve => {
    inquirer
      .prompt({
        type: 'confirm',
        message: '请确认上面发布仓库地址是否正确！！！',
        name: 'registry'
      })
      .then(answers => {
        if (answers.registry) {
          resolve();
        } else {
          process.exit();
        }
      });
  });
  execSync('npm whoami', {
    stdio: 'inherit'
  });
  await new Promise(resolve => {
    const build = spawn('node', [path.join(__dirname, '..', 'build', 'index.js')], {
      stdio: 'inherit'
    });
    build.on('close', resolve);
    build.on('exit', code => {
      if (code !== 0) {
        process.exit(code);
      }
    });
  });
  await new Promise(resolve => {
    const changeVersion = spawn(
      'node',
      [path.join(__dirname, '..', 'shared', 'changeVersion.js'), type],
      {
        stdio: 'inherit'
      }
    );
    changeVersion.on('close', resolve);
  });
  switch (type) {
    case 'alpha':
      execSync(
        `${lernaShell} publish -m "🤖 publish %s" --force-publish=* --cd-version=prerelease --preid=alpha --npm-tag=latest --skip-git  --yes`,
        {
          stdio: 'inherit'
        }
      );
      break;
    case 'beta':
      execSync(
        `${lernaShell}  publish -m "💍 publish %s" --force-publish=* --cd-version=prerelease --preid=beta --npm-tag=beta --yes`,
        {
          stdio: 'inherit'
        }
      );
      break;
    case 'rc':
      execSync(
        `${lernaShell} publish -m "💅 publish %s" --force-publish=* --cd-version=prerelease --preid=rc --npm-tag=rc --yes`,
        {
          stdio: 'inherit'
        }
      );
      break;
    case 'patch':
      execSync(
        `${lernaShell} publish -m "🎉 publish %s" --force-publish=* --cd-version=patch  --npm-tag=latest --yes`,
        {
          stdio: 'inherit'
        }
      );
      break;
  }

  if (type === 'alpha') {
    execSync('git checkout -- packages/**/package.json', {
      stdio: 'inherit'
    });
  }
})();
