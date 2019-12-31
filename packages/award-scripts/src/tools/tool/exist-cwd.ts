/**
 * 判断当前文件是否在当前执行的根目录下
 */
import * as os from 'os';

const dir = process.cwd();

export default (filePath: string) => {
  let regAward = /\/node_modules\/(.*)/;

  if (os.type() === 'Windows_NT') {
    regAward = /\\node_modules\\(.*)/;
  }
  let cwd = process.argv[1].replace(regAward, '');
  if (cwd === process.argv[1]) {
    cwd = dir;
  }

  let reg = new RegExp(`^${cwd}`);
  // 兼容windows版本
  if (os.type() === 'Windows_NT') {
    reg = new RegExp(`^${cwd.replace(/\\/g, '\\\\')}`);
  }
  if (!reg.test(filePath)) {
    return false;
  }
  return true;
};
