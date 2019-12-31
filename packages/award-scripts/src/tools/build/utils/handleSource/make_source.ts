/**
 * 整理资源
 */
import * as fs from 'fs-extra';
import * as MD5 from 'md5';
import { join } from 'path';
import { clean } from '../../../tool';

export default function makeSource(map: any, dir: any, publicPath: any) {
  // 样式资源合并
  if (map.moduleStyles) {
    if (map.moduleStyles[0] && /\module\.main/.test(map.moduleStyles[0])) {
      // 当前存在提取的module 样式，如果存在map[0]，则和map[0]合并，否则创建新的map[0]
      const modulePath = join(dir, publicPath, 'styles', map.moduleStyles[0]);
      let mainModuleCss = fs.readFileSync(modulePath, 'utf-8');
      if (map[0]) {
        const mainStyle = join(dir, publicPath, 'styles', map[0]);
        if (fs.existsSync(mainStyle)) {
          mainModuleCss += fs.readFileSync(mainStyle, 'utf-8');
          // 移除当前资源
          clean(mainStyle);
        }
      }
      // 移除main module资源文件
      clean(modulePath);
      map[0] = MD5(mainModuleCss).substr(0, 7) + '.css';
      // 创建新的main资源文件
      fs.writeFileSync(join(dir, publicPath, 'styles', map[0]), mainModuleCss);
      // 移除map.moduleStyles[0]
      delete map.moduleStyles[0];
    }
  }
  return map;
}
