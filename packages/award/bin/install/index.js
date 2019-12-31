// 这里属于运行包的范围，所以特殊处理了终端颜色标识

const reset = '\x1B[0m';

const yellow = str => {
  return '\x1B[33m' + str + reset;
};

const green = str => {
  return '\x1B[32m' + str + reset;
};

const grey = str => {
  return '\x1B[90m' + str + reset;
};

module.exports = () => {
  try {
    const { version: awardS } = require('award-scripts/package.json');
    const { version: awardV } = require('award/package.json');
    if (awardS !== awardV) {
      throw null;
    }
  } catch (error) {
    // 表示当前不存在该工具库，需要针对性安装
    const { version } = require('../../package.json');
    const pkg = green('award-scripts@' + version);
    console.info();
    console.info(yellow(' You need to install'), pkg, yellow('to devDependencies'));
    console.info();
    console.info(green(' npm install'), pkg, green('--save-dev'));
    console.info(grey(' OR'));
    console.info(green(' yarn add'), pkg, green('-D'));
    console.info();
    process.exit();
  }
};
