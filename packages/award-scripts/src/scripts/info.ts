import chalk = require('chalk');
import * as os from 'os';

export default {
  command: 'info',
  description: '获取本地系统信息以及框架项目信息',
  action() {
    const system = os.type();
    const { version } = require('award/package.json');
    const nodeVersion = process.version;
    console.info(`
 系统      ${chalk.yellow(system)}
 Award版本 ${chalk.yellow(version)}
 Node版本  ${chalk.yellow(nodeVersion)}
    `);
  }
};
