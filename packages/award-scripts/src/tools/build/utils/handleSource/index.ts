/**
 * 统一处理编译后的资源
 */
import { join } from 'path';
import nodePlugin from 'award-plugin/node';

import initMap from './init_map';
import dllSource from './dll_source';
import makeSource from './make_source';
import makeSplit from './make_split';
import noHash from './noHash';
import cleanCss from './clean_css';

/**
 * dir  项目根目录地址
 *
 * publicPath 项目导出目录，相对地址
 *
 * exportConfig 项目map资源存放目录，相对地址
 *
 */
export default async function handleSource(dir: any, publicPath: any, exportConfig: any) {
  await nodePlugin.hooks.source({ dir, dist: publicPath });

  /** 初始化map */
  let [map, rewriteMap] = initMap(dir, publicPath, exportConfig);

  /** 处理dll内产生的静态资源 */
  dllSource(dir, map, publicPath);

  /** 整理静态资源，主要针对样式 */
  map = makeSource(map, dir, publicPath);

  /** 整理自定义代码拆分产生的样式文件 */
  map = makeSplit(map, dir, publicPath);

  /** 如果资源不hash，需要对资源进行重命名 */
  noHash(map, dir, publicPath);

  /** 重写map */
  rewriteMap(map);

  /** 压缩样式资源 */
  cleanCss(map, join(dir, publicPath));
}
