import find = require('find-process');
import * as path from 'path';
import { killPortProcess } from 'kill-port-process';
import { loopWhile } from 'deasync';
import { spawn } from 'child_process';
import * as fs from 'fs-extra';
import clean from '../clean';
import closeStaticPort from '../close-static-port';

const pid: any[] = [];
const portFile = path.join(process.cwd(), 'node_modules', '.port');

const checkPort = (port: number) => {
  return new Promise((resolve) => {
    const check = spawn('node', [path.join(__dirname, 'check.js'), String(port)], {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    check.on('exit', (code) => {
      if (code === 0) {
        resolve({ close: true });
      } else if (code === 255) {
        process.exit(0);
      } else if (code === 1) {
        // 使用新端口
        if (fs.existsSync(portFile)) {
          const newPort = fs.readFileSync(portFile, 'utf-8');
          clean(portFile);
          resolve({ close: false, port: Number(newPort) });
        }
      }
    });
  });
};

const selectPort = (port: number) => {
  // 创建服务并监听该端口
  return new Promise((resolve) => {
    find('port', port).then((list: Array<any>) => {
      const _list = list.filter((item) => {
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
        resolve({ close: false });
      }
    });
  });
};

export default (port: number) => {
  let wait = true;
  let close = false;
  let newPort = null;
  selectPort(port).then((res: { close: boolean; port?: number }) => {
    wait = false;
    close = res.close;
    if (res.port) {
      newPort = res.port;
    }
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
  return newPort;
};
