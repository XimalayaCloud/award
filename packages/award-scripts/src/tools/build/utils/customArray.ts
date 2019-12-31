import chalk = require('chalk');

/**
 * 监听push变化
 */

const forbidden = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.scss',
  '.less',
  '.jpg',
  '.png',
  '.jpeg',
  '.gif',
  '.ttf',
  '.eot',
  '.woff',
  '.woff2',
  '.svg'
];

export default class CustomArray extends Array {
  public push(...args: any) {
    const _args: any = [];
    args.forEach((item: any) => {
      if (item.test) {
        const reg = new RegExp(item.test);
        let hasReg = false;
        forbidden.forEach(forb => {
          if (reg.test(forb)) {
            hasReg = true;
          }
        });

        if (hasReg) {
          console.warn(
            chalk.yellow(
              `award.config.js自定义配置webpack,不再支持下面自定义的rules配置\n${chalk.green(
                forbidden.join(' ')
              )}\n`
            )
          );
        } else {
          _args.push(item);
        }
      } else {
        throw new Error('webpack rules必须存在test');
      }
    });

    // 调用父类原型push方法
    return super.push(..._args);
  }
}
