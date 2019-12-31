import * as fs from 'fs-extra';
import * as path from 'path';
import * as chokidar from 'chokidar';
import stringHash = require('string-hash');
import { quickSort } from '../help';

const ch = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z'
];

const storeReference: any = {};
export const immerRandoms: any[] = [];

export default () => {
  // 打乱ch数组
  const l = ch.length;
  const cwd = process.cwd();
  let scope: any[] = [];
  for (var i = 0; i < l + 10; i++) {
    var rdm = i % 3;
    ch.push(ch[rdm]);
    ch.splice(rdm, 1);
  }

  // package.json定义过滤字符串
  if (path.join(cwd, 'package.json')) {
    scope = require(path.join(cwd, 'package.json')).scope || [];
  }

  // l * l 个随机两位字符
  const randoms: any[] = [];
  for (let i = 0; i < l; i++) {
    for (let j = 0; j < l; j++) {
      const left = ch[i];
      const right = ch[j];
      let result = '';
      if (left > right) {
        // 小写大写
        result = left + right + '_';
      } else if (left < right) {
        result = '_' + left + right;
      } else {
        result = left + '_' + right;
      }
      if (scope.indexOf(result) === -1) {
        randoms.push(result);
        immerRandoms.push(result);
      }
    }
  }

  let rl = randoms.length;

  const start = (filePath: string) => {
    // 取余得到序位
    const index = Number(stringHash(filePath.replace(cwd, '').replace(/(\/|\\)/g, ''))) % rl;
    // 数组直接取值
    const result = randoms[index];
    // 同时将原数组的该位置的移除
    randoms.splice(index, 1);

    // 存储
    storeReference[filePath] = result;

    // 总长度减1
    rl--;
  };

  // 遍历当前项目资源文件，要忽略根目录下的文件
  // 针对award特有的文件处理 .award、.dll、node_modules、.git
  const excludeDirs = ['.award', '.dll', 'node_modules', '.git', 'dist'].map(item =>
    path.join(cwd, item)
  );

  const ignoreDir = (filePath: string): boolean => {
    for (let i = 0; i < 5; i++) {
      const item = excludeDirs[i];
      if (filePath.indexOf(item) !== -1) {
        return true;
      }
    }
    return false;
  };

  const loopFile = (rootDir: string) => {
    const files = fs.readdirSync(rootDir);
    // 对当前files按规则顺序进行排序
    let newFiles: any[] = [];
    let newFileObj: any = {};
    files.forEach(filename => {
      const filePath = path.join(rootDir, filename);
      const hash = Number(stringHash(filePath.replace(cwd, '').replace(/(\/|\\)/g, '')));
      newFileObj[hash] = filename;
    });

    // 对newFileObj的key进行排序
    quickSort(Object.keys(newFileObj)).forEach((hash: number) => {
      newFiles.push(newFileObj[hash]);
    });

    newFiles.forEach(filename => {
      const filePath = path.join(rootDir, filename);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory() && !ignoreDir(filePath)) {
        // 如果当前路由是目录文件 且 不忽略当前路径
        // 那么将继续遍历该目录
        loopFile(filePath);
      } else if (stat.isFile()) {
        // 对js、jsx、ts、tsx文件进行处理
        if (/\.(t|j)sx?$/i.test(filename)) {
          start(filePath);
        }
      }
    });
  };

  let deleteRandom: any = null;
  const watch = chokidar
    .watch('**/*.{ts,tsx,js,jsx}', {
      ignored: /(\.dll|\.award|dist|node_modules|\.git)/,
      cwd
    })
    .on('add', filepath => {
      const filePath = path.join(cwd, filepath);
      if (!storeReference[filePath]) {
        // 添加不存在的文件
        if (deleteRandom) {
          storeReference[filePath] = deleteRandom;
        } else {
          start(filePath);
        }
      }
    })
    .on('unlink', filepath => {
      const filePath = path.join(cwd, filepath);
      // 删除文件
      if (storeReference[filePath]) {
        deleteRandom = storeReference[filePath];
        // 恢复到randoms数组中
        randoms.push(deleteRandom);
        rl++;
        delete storeReference[filePath];
      }
    });

  loopFile(cwd);

  global.EventEmitter.on('close_compiler_process', () => {
    watch.close();
  });
};

export const getHashByReference = (reference: string) => {
  const hash = storeReference[reference];
  if (hash) {
    return hash;
  }
  throw new Error(`未找到[ ${reference} ]对应的hash，请尝试重启开发服务，或联系框架维护人员`);
};
