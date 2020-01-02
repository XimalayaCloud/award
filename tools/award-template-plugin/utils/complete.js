const path = require('path');
const fs = require('fs');
const os = require('os');
const spawn = require('child_process').spawn;
const formate = require('./formate-json');
/**
 * 依赖排序
 */
function sortDependencies(data) {
  const packageJsonFile = path.join(data.destDir, 'package.json');
  const packageJson = JSON.parse(formate(fs.readFileSync(packageJsonFile, 'utf-8')));
  packageJson.dependencies = sortObject(packageJson.dependencies);
  fs.writeFileSync(packageJsonFile, JSON.stringify(packageJson, null, 2) + '\n');
}

/**
 * 安装依赖
 */
async function installDependencies(cwd, executable = 'npm', color) {
  console.log(`# ${color('正在安装项目依赖...')}\n`);
  const npmClient = os.type() === 'Windows_NT' ? 'npm.cmd' : 'npm';
  const yarnClient = os.type() === 'Windows_NT' ? 'yarn.cmd' : 'yarn';
  if (executable === 'npm') {
    return runCommand(npmClient, ['install'], {
      cwd
    });
  }
  return runCommand(yarnClient, [], {
    cwd
  });
}

/**
 * 打印安装结束后的提示
 */
function printMessage(data, { green, yellow }) {
  // 移动gitignore
  const oldgitignore = path.join(data.destDirName, 'gitignore');

  if (fs.existsSync(oldgitignore)) {
    fs.rename(oldgitignore, path.join(data.destDirName, '.gitignore'), () => {});
  }

  // 移动npmignore
  const oldnpmignore = path.join(data.destDirName, 'src', 'npmignore');

  if (fs.existsSync(oldnpmignore)) {
    fs.rename(oldnpmignore, path.join(data.destDirName, 'src', '.npmignore'), () => {});
  }

  let message = `
${green('插件模板初始化完成!')}
-------------------------------------------

开发:
    ${yellow(
      `${data.inPlace ? '' : `cd ${data.destDirName}\n    `}${installMsg(data)}  npm run dev`
    )}

发布插件:
    ${yellow('npm run build')}

更多插件开发指南，请查阅当前项目的readme.md文档

`;
  console.log(message);
  process.exit();
}

/**
 * 提示开发者需要安装依赖
 */
function installMsg(data) {
  return !data.autoInstall ? 'npm install \n  ' : '';
}

/**
 * 运行命令
 */
function runCommand(cmd, args, options) {
  return new Promise((resolve, reject) => {
    const spwan = spawn(cmd, args, {
      stdio: 'inherit',
      ...options
    });

    spwan.on('exit', () => {
      resolve();
    });
  });
}

function sortObject(object) {
  const sortedObject = {};
  Object.keys(object)
    .sort()
    .forEach(item => {
      sortedObject[item] = object[item];
    });
  return sortedObject;
}

module.exports = function(data, { chalk }) {
  const green = chalk.green;
  const cwd = data.destDir;

  process.on('SIGINT', () => {
    printMessage(data, chalk);
  });

  sortDependencies(data);

  if (data.autoInstall) {
    installDependencies(cwd, data.autoInstall, green)
      .then(() => {
        printMessage(data, chalk);
      })
      .catch(e => {
        console.log(chalk.red('Error:'), e);
      });
  } else {
    printMessage(data, chalk);
  }
};
