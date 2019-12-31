import * as path from 'path';
import * as fs from 'fs';
import { killPortProcess } from 'kill-port-process';
import { loopWhile } from 'deasync';
import existPort from './exist-port';

export default () => {
  // 关闭静态资源端口
  let staticPort = null;
  const cachePath = path.join(process.cwd(), 'node_modules', '.cache', 'award');
  const cachePort = path.join(cachePath, '.port');
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
