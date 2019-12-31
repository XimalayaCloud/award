import * as os from 'os';

export default (filePath: string) => {
  let regNodeModules = /\/node_modules\//;
  let regAward = /\/node_modules\/award/;

  // 兼容windows版本
  if (os.type() === 'Windows_NT') {
    regAward = /\\node_modules\\award/;
    regNodeModules = /\\node_modules\\/;
  }
  // 不忽略 node_modules\/award
  if (regAward.test(filePath)) {
    return true;
  }
  // 忽略  node_modules
  if (regNodeModules.test(filePath)) {
    return false;
  }
  // 其余都不忽略
  return true;
};
