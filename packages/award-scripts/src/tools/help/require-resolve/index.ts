/* eslint-disable no-param-reassign */
import * as locate from './locate';
import _path = require('x-path');

const getPkg = locate.getPkg;
const getModuleDir = locate.getModuleDir;

const EXTENSIONS = ['.js', '.json', '.ts', '.tsx', '.jsx'];
const MAIN = 'index';
const _sep = '/';

function resolveDir(dir: any) {
  let file;
  let main;
  let isDir;

  const pkg = getPkg(dir);

  main = (pkg && pkg.root === dir && pkg.main) || MAIN;

  isDir = main === '.' || main === './' || /(?:\/\.{0,2})$/.test(main);
  file = _path.resolve(dir, main, isDir ? MAIN : '');
  return resolveFile(file);
}

function resolveFile(file: any) {
  let i;
  const exts = [''].concat(EXTENSIONS);
  for (i = 0; i < exts.length; i++) {
    if (_path.isFileSync(file + exts[i])) {
      return file + exts[i];
    }
  }
  return null;
}

function resolve(filePath: any, isDir: any) {
  if (isDir) {
    return resolveDir(filePath);
  } else {
    let result = resolveFile(filePath);
    if (!result) {
      result = resolveDir(filePath);
    }
    return result;
  }
}

export default (requiredPath: any, refFile: any): any => {
  requiredPath = _path.normalizePathSeparate(requiredPath, _sep);
  refFile = _path.normalizePathSeparate(refFile || process.cwd(), _sep);

  const isDir = /(?:\/\.{0,2})$/.test(requiredPath);
  const refDir = _path.dirname(refFile);
  let result;

  if (_path.isAbsolutePath(requiredPath)) {
    result = resolve(requiredPath, isDir);
  } else if (_path.isRelativePath(requiredPath)) {
    result = resolve(_path.resolve(refDir, requiredPath), isDir);
  } else {
    let moduleName;
    let modulePath;
    let moduleDir;
    const parts = requiredPath.split(_sep);

    moduleName = parts.shift();
    modulePath = parts.join(_sep);
    moduleDir = getModuleDir(refDir, moduleName);

    if (moduleDir) {
      result = resolve(_path.join(moduleDir, modulePath), isDir);
    }
  }

  return result ? { src: result, pkg: getPkg(_path.dirname(result)) } : null;
};
