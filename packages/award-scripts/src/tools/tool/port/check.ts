/**
 * 开启子进程进行check
 */
import * as inquirer from 'inquirer';
import find = require('find-process');
import * as fs from 'fs-extra';
import * as path from 'path';

const port = process.argv.slice(2)[0];
const pid: any[] = [];
const portFile = path.join(process.cwd(), 'node_modules', '.port');

const findAvailablePort = async () => {
  let currentPort = Math.floor(Math.random() * 30000 + 10000);
  let receive = false;
  await new Promise(async resolve => {
    while (!receive) {
      await new Promise(_resolve => {
        find('port', currentPort).then((list: Array<any>) => {
          const _list = list.filter(item => {
            if (pid.indexOf(item.pid) === -1) {
              pid.push(item.pid);
              return true;
            } else {
              return false;
            }
          });
          if (_list.length) {
            currentPort = Math.floor(Math.random() * 30000 + 10000);
          } else {
            receive = true;
          }
          _resolve();
        });
      });
    }
    resolve();
  });
  return currentPort;
};

inquirer
  .prompt({
    type: 'confirm',
    message: '端口【' + port + '】 已经被占用，是否关闭该端口？',
    name: 'target'
  })
  .then(async (answers: any) => {
    if (answers.target) {
      process.exit(0);
    } else {
      const newPort = await findAvailablePort();
      inquirer
        .prompt({
          type: 'confirm',
          message: '是否使用推荐端口【' + newPort + '】 ？',
          name: 'target'
        })
        .then(async (answer: any) => {
          if (answer.target) {
            fs.writeFileSync(portFile, newPort);
            process.exit(1);
          } else {
            process.exit(-1);
          }
        });
    }
  });
