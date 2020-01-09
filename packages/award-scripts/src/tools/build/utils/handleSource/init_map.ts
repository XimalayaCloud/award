/**
 * 初始化map表
 */

import * as fs from 'fs-extra';
import { join } from 'path';

export default function initMap(dir: any, publicPath: any, exportConfig: any) {
  const publicMapFile = join(dir, publicPath, 'map.json'); // webpack编译导出的map文件
  const exportMapFile = join(dir, exportConfig, 'map.json'); // 存储map文件的文件目录

  const publicMap_exist = fs.existsSync(publicMapFile);

  if (publicMap_exist) {
    fs.moveSync(publicMapFile, exportMapFile);
  }

  // 初始化map数据
  const map = publicMap_exist ? JSON.parse(fs.readFileSync(exportMapFile, 'utf-8')) : {};

  // 移动manifest文件位置
  const manifest = join(dir, publicPath, 'manifest.js');
  if (fs.existsSync(manifest)) {
    fs.moveSync(manifest, join(dir, exportConfig, 'manifest.js'));
  }

  // 如果有favicon.ico 移动favicon.ico
  const ico = join(dir, 'favicon.ico');
  if (fs.existsSync(ico)) {
    fs.copySync(ico, join(dir, publicPath, 'favicon.ico'));
  }

  return [
    map,
    (_map_: any) => {
      // 重新写入新的配置
      if (publicMap_exist) {
        fs.writeFileSync(exportMapFile, JSON.stringify(_map_));
      }
    }
  ];
}
