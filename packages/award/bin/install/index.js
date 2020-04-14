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
    const rv = require('react/package.json').version;
    const rdV = require('react-dom/package.json').version;
    if (rv !== rdV) {
      throw {
        message: ` ${yellow(`react@${rv}`)} 和 ${yellow(`react-dom@${rdV}`)} 的版本号必须 ${green(
          '保持一致'
        )} `
      };
    } else {
      var vs = rv.split('.');
      if (vs[0] < 17 && vs[1] < 3) {
        throw {
          message: ` ${yellow(`react@${rv}`)} 和 ${yellow(`react-dom@${rdV}`)} 的版本号必须 ${green(
            `>=16.3.0`
          )} `
        };
      }
    }
  } catch (error) {
    console.info();
    console.info(error.message);
    console.info();
    process.exit(-1);
  }

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
    process.exit(-1);
  }
};
