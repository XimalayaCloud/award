/**
 * 开启子进程进行check
 */
import * as inquirer from 'inquirer';
import find = require('find-process');
import * as fs from 'fs-extra';
import * as chalk from 'chalk';
import * as path from 'path';

const port = process.argv.slice(2)[0];
const pid: any[] = [];
const portFile = path.join(process.cwd(), 'node_modules', '.port');

const findAvailablePort = async (port: string) => {
  let currentPort = Number(port) + 1;
  let receive = false;
  await new Promise(async (resolve) => {
    while (!receive) {
      await new Promise((_resolve) => {
        find('port', currentPort).then((list: Array<any>) => {
          const _list = list.filter((item) => {
            if (pid.indexOf(item.pid) === -1) {
              pid.push(item.pid);
              return true;
            } else {
              return false;
            }
          });
          if (_list.length) {
            currentPort = currentPort + 1;
          } else {
            receive = true;
          }
          _resolve(undefined);
        });
      });
    }
    resolve(undefined);
  });
  return currentPort;
};

(async () => {
  const newPort = await findAvailablePort(port);
  inquirer
    .prompt({
      type: 'confirm',
      message: `端口【 ${chalk.bold.yellow(
        port
      )} 】已经被占用，是否使用推荐端口【 ${chalk.bold.green(newPort)} 】 ？`,
      name: 'target'
    })
    .then(async (answers: any) => {
      if (answers.target) {
        fs.writeFileSync(portFile, String(newPort));
        process.exit(1);
      } else {
        inquirer
          .prompt({
            type: 'confirm',
            message: `是否强制关闭端口【 ${chalk.bold.yellow(port)} 】？`,
            name: 'target'
          })
          .then(async (answer: any) => {
            if (answer.target) {
              process.exit(0);
            } else {
              process.exit(-1);
            }
          });
      }
    });
})();
