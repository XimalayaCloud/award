/* eslint-disable max-nested-callbacks */
import * as fs from 'fs';
import hashString = require('string-hash');
import * as path from 'path';
import constant from '../../../../tool/constant';

const pluginName = 'WriteStyleMapPlugin';
const cwd = process.cwd();

const styleModulefile = path.join(constant.CACHE_DIR, '.moduleStyles.json');

const originFile = (pwd: string, origin: string) => {
  const file = path.join(pwd, origin);
  if (/\.(jsx?|tsx?)$/.test(file)) {
    return file;
  } else {
    const filejs = file + '.js';
    const filejsx = file + '.jsx';
    const filets = file + '.ts';
    const filetsx = file + '.tsx';
    if (fs.existsSync(filejs)) {
      return filejs;
    }
    if (fs.existsSync(filejsx)) {
      return filejsx;
    }
    if (fs.existsSync(filets)) {
      return filets;
    }
    if (fs.existsSync(filetsx)) {
      return filetsx;
    }
    // 继续拼接index
    const indexfilejs = path.join(file, 'index.js');
    const indexfilejsx = path.join(file, 'index.jsx');
    const indexfilets = path.join(file, 'index.ts');
    const indexfiletsx = path.join(file, 'index.tsx');
    if (fs.existsSync(indexfilejs)) {
      return indexfilejs;
    }
    if (fs.existsSync(indexfilejsx)) {
      return indexfilejsx;
    }
    if (fs.existsSync(indexfilets)) {
      return indexfilets;
    }
    if (fs.existsSync(indexfiletsx)) {
      return indexfiletsx;
    }
  }
  return null;
};

export default class WriteStyleMapPlugin {
  public apply(compiler: any) {
    let extraFile: any = [];
    compiler.hooks.done.tap('done', (doneInfo: any) => {
      doneInfo.extraFile = extraFile;
    });

    compiler.hooks.emit.tapAsync(pluginName, (compilation: any, callback: Function) => {
      /**
       * 计算chunks
       *
       * ```js
       * chunkEntry = {
       *   "82718212": ["a.css","b.css"],  // index.js  hash
       *   "3312212" : ["a.css","c.css"] // detail.js hash
       * }
       * ```
       */
      const chunkEntry: any = {};
      const chunkFiles: any = {};
      compilation.chunks.forEach((item: any) => {
        const files = item.files;
        const hashs: any = [];
        // 处理chunk入口资源
        const groups = Array.from(item._groups);
        groups.forEach((group: any) => {
          const origins = group.origins;
          origins.forEach((origin: any) => {
            if (origin.request && origin.module) {
              const originFilename = originFile(origin.module.context, origin.request);
              if (originFilename && fs.existsSync(originFilename)) {
                // 找到当前的request依赖
                const hash = String(hashString(originFilename.replace(cwd, '')));
                hashs.push(hash);
                if (!chunkEntry[hash]) {
                  chunkEntry[hash] = [];
                }
              }
            }
          });
        });

        if (!chunkFiles[item.id]) {
          chunkFiles[item.id] = files;
        } else {
          files.forEach((file: any) => {
            if (/\.css$/.test(file)) {
              // 额外的样式资源
              extraFile.push(file.match(/.*\/(.*\.css)$/)[1]);
            }
          });
          chunkFiles[item.id] = [...chunkFiles[item.id], ...files];
        }

        // 关联chunk的css资源
        let filename = '';
        chunkFiles[item.id].forEach((file: any) => {
          if (/\.css$/.test(file)) {
            filename = file.match(/.*\/(.*\.css)$/)[1];
            hashs.forEach((hash: any) => {
              chunkEntry[hash].push(filename);
            });
          }
        });

        if (item.name === 'main' && filename) {
          // common 的第三方资源依赖
          chunkEntry[0] = filename;
        }
      });

      fs.writeFileSync(styleModulefile, JSON.stringify(chunkEntry));

      let map = compilation.assets['map.json'];
      if (map) {
        map = JSON.parse(map.source());
        map.moduleStyles = chunkEntry;
        map = JSON.stringify(map);

        compilation.assets['map.json'] = {
          source() {
            return map;
          },
          size() {
            return map.length;
          }
        };
      }
      callback();
    });
  }
}
