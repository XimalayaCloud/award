/**
 * 获取随机的端口供子进程使用
 */
import * as _ from 'lodash';
import * as fs from 'fs-extra';
import * as path from 'path';
import find = require('find-process');
import { getIPAdress } from 'award-utils/server';
import { loopWhile } from 'deasync';
import clean from './clean';
import constant from './constant';

const pid: any[] = [];

module.exports = () => {
  // 获取ip
  const ip = getIPAdress();
  let url = 'http://127.0.0.1:';
  if (!_.isUndefined(ip) && ip) {
    url = 'http://' + ip + ':';
  }

  // 获取端口
  let port = Math.floor(Math.random() * 30000 + 10000);
  const cachePort = path.join(constant.CACHE_DIR, '.port');
  if (fs.existsSync(cachePort)) {
    port = Number(fs.readFileSync(cachePort, 'utf-8'));
  }

  let receive = false;

  // 使用loopWhile在同步任务里面执行异步任务
  let wait = true;
  new Promise(async resolve => {
    while (!receive) {
      await new Promise(_resolve => {
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
            if (fs.existsSync(cachePort)) {
              // 表示端口出问题了，需要将缓存全部清除
              clean(cachePath);
              fs.mkdirpSync(cachePath);
            }
            port = Math.floor(Math.random() * 30000 + 10000);
          } else {
            receive = true;
          }
          _resolve();
        });
      });
    }
    resolve();
  }).then(() => {
    wait = false;
  });

  loopWhile(() => wait);
  fs.writeFileSync(cachePort, port);
  process.env.CHILDPROCESS_COMPILER_PORT = String(port);
  process.env.CHILDPROCESS_COMPILER_URL = url + String(port);
};
