/**
 * 样式随机两位数scope算法，在一定程度上保证了稳定随机
 * 同时增加了map文件，默认没有，需要package.json指定
 */
import fetch from 'award-fetch';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as chokidar from 'chokidar';
import stringHash = require('string-hash');
import { quickSort } from '../help';
import { regNodeModules } from '../help';

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
const immerRandoms: any[] = [];
const cwd = process.cwd();
const mapFilepath = path.join(cwd, '.map');

const readMapToJson = () => {
  // 读写map
  const obj: any = {};
  if (fs.existsSync(mapFilepath)) {
    const file = fs.readFileSync(mapFilepath, 'utf-8');
    let i = 0;
    let l = file.length;

    let lineKey = '';
    let lineValue = '';
    let countValue = false;

    while (i < l) {
      const d = file[i];
      if (d === '\n') {
        if (lineKey) {
          obj[lineKey] = lineValue;
        }
        // 进入下一行
        lineKey = '';
        lineValue = '';
        countValue = false;
      } else {
        if (d === ' ') {
          countValue = true;
        } else {
          if (countValue) {
            lineValue += d;
          } else {
            lineKey += d;
          }
        }
      }
      i++;
    }
    if (lineKey) {
      obj[lineKey] = lineValue;
    }
  }
  return obj;
};

const writeJsonToMap = (obj: any) => {
  const newFile = [];
  for (const key in obj) {
    newFile.push(`${key} ${obj[key]}`);
  }
  fs.writeFileSync(mapFilepath, newFile.join('\n'));
};

export default () => {
  const maps = readMapToJson();
  const newMaps: any = {};
  // 打乱ch数组
  const l = ch.length;

  let scope: any[] = [];
  let isNeedMap = false;
  for (var i = 0; i < l + 10; i++) {
    var rdm = i % 3;
    ch.push(ch[rdm]);
    ch.splice(rdm, 1);
  }

  // package.json定义过滤字符串
  if (path.join(cwd, 'package.json')) {
    const pkg = require(path.join(cwd, 'package.json'));
    scope = pkg.scope || [];
    // 需要项目package.json指定map才能使用，否则默认不开启
    isNeedMap = pkg.map || false;
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
    const hash = Number(stringHash(filePath.replace(cwd, '').replace(/(\/|\\)/g, '')));
    let index: any = null;
    let value: any = null;
    if (maps[hash]) {
      // 从缓存中取出固定随机数的值
      value = maps[hash];
      index = randoms.indexOf(value);
    } else {
      // 缓存没有，则通过取余的形式来获取
      index = hash % rl;
      value = randoms[index];
    }

    // 同时需要将原数据的位置从数组中移除
    randoms.splice(index, 1);

    // 存储
    maps[hash] = value;
    newMaps[hash] = value;
    const lowerFilePath = filePath.toLocaleLowerCase();
    storeReference[lowerFilePath] = value;

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

  const loopDeleteParentMod = (mod: any) => {
    if (mod) {
      // 删除当前mod
      if (!regNodeModules.test(mod.id)) {
        fetch.clean(mod.id);
        delete require.cache[mod.id];
      }
      loopDeleteParentMod(mod.parent);
    }
  };

  let deleteRandom: any = null;
  const watch = chokidar
    .watch('**/*.{ts,tsx,js,jsx}', {
      ignored: /(\.dll|\.award|dist|node_modules|\.git)/,
      cwd
    })
    .on('add', filepath => {
      const filePath = path.join(cwd, filepath);
      const lowerFilePath = filePath.toLocaleLowerCase();
      if (!storeReference[lowerFilePath]) {
        // 添加不存在的文件
        if (deleteRandom) {
          storeReference[lowerFilePath] = deleteRandom;
        } else {
          start(filePath);
        }
      }
    })
    .on('unlink', filepath => {
      const filePath = path.join(cwd, filepath);
      const lowerFilePath = filePath.toLocaleLowerCase();
      // 删除文件
      if (storeReference[lowerFilePath]) {
        deleteRandom = storeReference[lowerFilePath];
        // 恢复到randoms数组中
        randoms.push(deleteRandom);
        rl++;
        delete storeReference[lowerFilePath];
      }
    })
    .on('change', filepath => {
      // 这里只对改变的文件进行缓存清除
      const fullPath = path.join(cwd, filepath);
      const mod = require.cache[fullPath];
      loopDeleteParentMod(mod);
    });

  loopFile(cwd);

  // 写map
  if (isNeedMap) {
    writeJsonToMap(newMaps);
  }

  global.EventEmitter.on('close_compiler_process', () => {
    if (isNeedMap) {
      writeJsonToMap(newMaps);
    }
    watch.close();
  });
};

export const getHashByReference = (reference: string) => {
  const lowerReference = reference.toLocaleLowerCase();
  const hash = storeReference[lowerReference];
  if (hash) {
    return hash;
  }
  throw new Error(`未找到[ ${reference} ]对应的hash，请尝试重启开发服务，或联系框架维护人员`);
};
