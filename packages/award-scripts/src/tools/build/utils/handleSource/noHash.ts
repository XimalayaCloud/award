/**
 * 文件名称不进行hash处理
 */

import * as fs from 'fs-extra';
import { join } from 'path';

export default function noHash(map: any, dir: any, publicPath: any) {
  let noHash = false;

  if (process.env.HASHNAME === '0') {
    noHash = true;
  }

  // 如果hashName为false，则需要修改名字
  if (noHash && map.main) {
    const main = map.main.replace(/\.css$/, '');
    const mainJs = join(dir, publicPath, 'scripts', main + '.js');
    if (fs.existsSync(mainJs)) {
      fs.moveSync(mainJs, join(dir, publicPath, 'scripts', 'main.js'));
    }
  }

  // 样式修改名字
  if (noHash && map[0]) {
    const mainStyle = join(dir, publicPath, 'styles', map[0]);
    if (fs.existsSync(mainStyle)) {
      fs.moveSync(mainStyle, join(dir, publicPath, 'styles', 'main.css'));
    }
  }
}
