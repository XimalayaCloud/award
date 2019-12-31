/**
 * 处理external资源
 */
import * as fs from 'fs-extra';
import { join } from 'path';

export default function external(dir: any, publicPath: any) {
  // 解析external
  const pkg = JSON.parse(fs.readFileSync(join(dir, 'package.json'), 'utf-8'));
  if (pkg.external) {
    const externalDir = join(dir, publicPath, 'external');
    fs.mkdirSync(externalDir);
    for (const key in pkg.external) {
      if (
        pkg.external.hasOwnProperty(key) &&
        !/^http(s)?/.test(pkg.external[key]) &&
        !/^\//.test(pkg.external[key])
      ) {
        const filename = join(dir, pkg.external[key]);
        if (fs.existsSync(filename)) {
          fs.copyFileSync(filename, join(externalDir, key));
        }
      }
    }
  }
}
