/**
 * 样式随机两位数scope算法，在一定程度上保证了稳定随机
 * 同时增加了map文件，默认没有，需要package.json指定
 */
import fetch from 'award-fetch';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as chokidar from 'chokidar';
import stringHash = require('string-hash');
import { quickSort, regNodeModules } from '../help';

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
const cwd = process.cwd();
const mapFilepath = path.join(cwd, '.map');

/**
 * award项目，默认忽略这些文件夹
 *
 * 即这些文件夹不参与任何award项目的编译
 */
let ignoreReg = /(\.dll|\.award|dist|node_modules|\.git)/;

if (/node_modules/.test(cwd)) {
  // 如果当前主目录在node_modules内，就不忽略当前node_modules内的内容
  const filePath = cwd.replace(/(.*)node_modules\//, '');
  ignoreReg = new RegExp(
    `(\\.dll|\\.award|dist|node_modules\\/(?!${filePath.replace(/\//, '\\/')})|\\.git)`
  );
}

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
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      newFile.push(`${key} ${obj[key]}`);
    }
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
  for (let i = 0; i < l + 10; i++) {
    let rdm = i % 3;
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

  const hasScope = [...Object.values(maps), ...scope];

  // l * l 个随机两位字符
  const randoms: any[] = [];
  for (let i = 0; i < l; i++) {
    for (let j = 0; j < l; j++) {
      const left = ch[i];
      const right = ch[j];

      const result1 = left + right + '_';
      const result2 = '_' + left + right;
      const result3 = left + '_' + right;

      if (hasScope.indexOf(result1) === -1) {
        randoms.push(result1);
      }
      if (hasScope.indexOf(result2) === -1) {
        randoms.push(result2);
      }
      if (hasScope.indexOf(result3) === -1) {
        randoms.push(result3);
      }
    }
  }

  let rl = randoms.length;

  const start = (filePath: string) => {
    // 取余得到序位
    const newfileFilePath = filePath.replace(cwd, '').replace(/(\/|\\)/g, '');
    const hash = Number(stringHash(newfileFilePath));
    let value: any = null;
    if (maps[hash]) {
      // 从缓存中取出固定随机数的值
      value = maps[hash];
    } else {
      // 缓存没有，则通过取余的形式来获取
      const index = hash % rl;
      value = randoms[index];
      // 同时需要将原数据的位置从数组中移除
      randoms.splice(index, 1);
    }

    // 存储
    maps[hash] = value;
    newMaps[hash] = value;
    const lowerFilePath = filePath.toLocaleLowerCase();
    storeReference[lowerFilePath] = value;

    // 总长度减1
    rl--;
  };

  const loopFile = (rootDir: string) => {
    const files = fs.readdirSync(rootDir);
    // 对当前files按规则顺序进行排序
    let newFiles: any[] = [];
    let newFileObj: any = {};
    files.forEach((filename) => {
      const filePath = path.join(rootDir, filename);
      const hash = Number(stringHash(filePath.replace(cwd, '').replace(/(\/|\\)/g, '')));
      newFileObj[hash] = filename;
    });

    // 对newFileObj的key进行排序
    quickSort(Object.keys(newFileObj)).forEach((hash: number) => {
      newFiles.push(newFileObj[hash]);
    });

    newFiles.forEach((filename) => {
      const filePath = path.join(rootDir, filename);
      const stat = fs.statSync(filePath);

      if (ignoreReg.test(filePath)) {
        return;
      }

      if (stat.isDirectory()) {
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
      ignored: ignoreReg,
      cwd
    })
    .on('add', (filepath) => {
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
    .on('unlink', (filepath) => {
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
    .on('change', (filepath) => {
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
