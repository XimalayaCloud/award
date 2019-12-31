import { regNodeModules } from '../help';
import * as os from 'os';

let pkgReg = /\/packages\/award[-\/]/;

if (os.type() === 'Windows_NT') {
  pkgReg = /\\packages\\award[-\\]/;
}

/**
 * 遍历缓存来查找通过特定模块名缓存下的模块
 */
function searchCache(moduleName: string, callback: Function) {
  //  通过指定的名字resolve模块
  const filepath: any = require.resolve(moduleName);
  const mods: any[] = [];
  // 检查该模块在缓存中是否被resolved并且被发现
  if (filepath) {
    const mod = require.cache[filepath];
    if (mod) {
      // 递归的检查结果
      (function traverse(_mod) {
        // 检查该模块的子模块并遍历它们
        if (_mod.children.length) {
          _mod.children.forEach((child: any) => {
            /**
             * 1. 当前module不在node_modules里面  且
             * 2. 当前module未删除   且
             * 3. 当前文件在node_modules里面
             *    或
             *    当前文件不在node_modules里面且当前module路径不属于award库的
             */
            if (
              !regNodeModules.test(child.id) &&
              mods.indexOf(child.id) === -1 &&
              (regNodeModules.test(__dirname) ||
                (!regNodeModules.test(__dirname) && !pkgReg.test(child.id)))
            ) {
              mods.push(child.id);
              traverse(child);
            }
          });
        }
        callback(_mod);
      })(mod);
    }
  }
}

/**
 * 从缓存中移除module
 */
const remove = (moduleName: string) => {
  // 遍历缓存来找到通过指定模块名载入的文件
  searchCache(moduleName, (mod: any) => {
    delete require.cache[mod.id];
  });

  // 删除模块缓存的路径
  if ((module.constructor as any)._pathCache) {
    Object.keys((module.constructor as any)._pathCache).forEach(cacheKey => {
      if (cacheKey.indexOf(moduleName) > 0) {
        delete (module.constructor as any)._pathCache[cacheKey];
      }
    });
  }
};

export = remove;

module.exports = remove;
