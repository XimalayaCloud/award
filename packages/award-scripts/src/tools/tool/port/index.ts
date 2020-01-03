import find = require('find-process');
import * as path from 'path';
import { killPortProcess } from 'kill-port-process';
import { loopWhile } from 'deasync';
import { spawn } from 'child_process';
import closeStaticPort from '../close-static-port';
const pid: any[] = [];

const checkPort = (port: number) => {
  return new Promise(resolve => {
    const check = spawn('node', [path.join(__dirname, 'check.js'), String(port)], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    check.on('exit', data => {
      if (data === 0) {
        resolve(true);
      } else {
        process.exit(0);
      }
    });
  });
};

const selectPort = (port: number) => {
  // 创建服务并监听该端口
  return new Promise(resolve => {
    find('port', port).then((list: Array<any>) => {
      const _list = list.filter(item => {
        if (pid.indexOf(item.pid) === -1) {
          pid.push(item.pid);
          return true;
        } else {
          return false;
        }
      });
      if (_list.length) {
        checkPort(port).then(resolve);
      } else {
        resolve(false);
      }
    });
  });
};

export default (port: number) => {
  let wait = true;
  let close = false;
  selectPort(port).then((ret: boolean) => {
    wait = false;
    close = ret;
  });
  loopWhile(() => wait);

  if (close) {
    let waitPort = true;
    killPortProcess(port).then(() => {
      waitPort = false;
    });
    loopWhile(() => waitPort);
    closeStaticPort();
  }
};
