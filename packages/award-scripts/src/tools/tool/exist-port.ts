import find = require('find-process');
import { loopWhile } from 'deasync';

const pid: any[] = [];

const checkPort = (port: number) => {
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
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

export default (port: number) => {
  let wait = true;
  let close = false;
  checkPort(port).then((ret: boolean) => {
    wait = false;
    close = ret;
  });
  loopWhile(() => wait);
  return close;
};
