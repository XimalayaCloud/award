/**
 * 初始化map表
 */

import * as fs from 'fs-extra';
import * as MD5 from 'md5';
import { join } from 'path';

export default function initMap(dir: any, publicPath: any, exportConfig: any) {
  const Common_js = join(dir, '.dll', 'common.js'); // dll导出的公共依赖文件
  const publicMapFile = join(dir, publicPath, 'map.json'); // webpack编译导出的map文件
  const exportMapFile = join(dir, exportConfig, 'map.json'); // 存储map文件的文件目录

  const commonjs_exist = fs.existsSync(Common_js);
  const publicMap_exist = fs.existsSync(publicMapFile);

  if (publicMap_exist) {
    fs.moveSync(publicMapFile, exportMapFile);
  }

  // 合并map内容，并对文件名称进行md5处理
  const map = {
    'common.js': commonjs_exist
      ? process.env.HASHNAME === '1'
        ? MD5(fs.readFileSync(Common_js, 'utf-8')).substr(0, 9) + '.js'
        : 'common.js'
      : null,
    ...(publicMap_exist
      ? {
          ...JSON.parse(fs.readFileSync(exportMapFile, 'utf-8'))
        }
      : {})
  };

  // 拷贝common.js
  if (commonjs_exist) {
    fs.copySync(Common_js, join(dir, publicPath, 'scripts', map['common.js']));
  }

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
