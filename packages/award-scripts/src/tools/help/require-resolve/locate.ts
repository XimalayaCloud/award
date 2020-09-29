/* eslint-disable no-param-reassign */
import path = require('x-path');
const sep = '/';

const allCache: any = {};

function getCache(group: any) {
  if (!allCache.hasOwnProperty(group)) {
    allCache[group] = {};
  }
  return allCache[group];
}

function directoryUp(dir: any, name: any, type: any, cb: any, disableCache = false) {
  let i;
  let cache;
  let dirs;
  let filePath;
  let result;

  dirs = dir.split(sep).map((d: any, i: any, ref: any) => {
    return ref.slice(0, i + 1).join(sep);
  });

  cache = getCache(type + ':' + name);
  type = /file/.test(type) ? 'isFileSync' : 'isDirectorySync';

  for (i = dirs.length - 1; i >= 0; i--) {
    dir = dirs[i];
    filePath = path.join(dir, name);
    if (!disableCache && cache[dir]) {
      i++;
      result = cache[dir];
      break;
    }

    if (path[type](filePath)) {
      result = cb(filePath, dir, name);
      if (result) {
        break;
      }
    }
  }

  if (!disableCache && result) {
    while (i < dirs.length) {
      cache[dir] = result;
      i++;
    }
  }
  return result || null;
}

export const getPkg = function (dir: any) {
  return directoryUp(dir, 'package.json', 'file', (filePath: any, dir: any) => {
    let pkg;
    let result;
    try {
      pkg = require(filePath);
    } catch (e) {}

    if (pkg?.name && pkg.version) {
      result = {
        name: pkg.name,
        version: pkg.version,
        main: pkg.main,
        root: dir
      };
    }
    return result;
  });
};

export const getModuleDir = (dir: any, moduleName: any) => {
  moduleName = moduleName || '';
  return directoryUp(
    dir,
    'node_modules',
    'directory',
    (filePath: any) => {
      filePath = path.join(filePath, moduleName);
      if (path.isDirectorySync(filePath)) {
        return filePath;
      }
    },
    true
  );
};
