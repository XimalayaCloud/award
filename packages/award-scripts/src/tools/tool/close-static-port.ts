import * as path from 'path';
import * as fs from 'fs';
import { killPortProcess } from 'kill-port-process';
import { loopWhile } from 'deasync';
import existPort from './exist-port';
import constant from './constant';

export default () => {
  // 关闭静态资源端口
  let staticPort = null;
  const cachePort = path.join(constant.CACHE_DIR, '.port');
  if (fs.existsSync(cachePort)) {
    staticPort = Number(fs.readFileSync(cachePort, 'utf-8'));
  }
  if (staticPort) {
    if (existPort(staticPort)) {
      let waitstaticPort = true;

      killPortProcess(staticPort).then(() => {
        waitstaticPort = false;
      });
      loopWhile(() => waitstaticPort);
    }
  }
};
