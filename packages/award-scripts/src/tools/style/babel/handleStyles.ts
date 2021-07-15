/* eslint-disable max-depth */
/* eslint-disable array-callback-return */
/**
 * 生成jsx的style对象，同时插入转译的样式资源
 * 寻找到当前js里面的第一个JSXElement组件，然后开始分析样式
 */
import hashString = require('string-hash');
import chalk = require('chalk');
import md5 = require('md5');
import * as fs from 'fs-extra';
import * as path from 'path';
import { quickSort, memoryFile } from '../../help';

import postcssParse from '../postcss-parse';
import { dev } from '../utils';
import { getHashByReference } from '../../tool/createProjectFileHash';
import clean from '../../tool/clean';
import constant from '../../tool/constant';

// 记录样式是否出现重复的引用，主要用来做css导出使用的
const styleIds: any = [];
const globalIds: any = [];
const cwd = process.cwd();

// eslint-disable-next-line complexity
export default (cache: any, state: any) => {
  // 分析该js对应的样式资源
  const reference = state?.file?.opts.filename;
  if (global.ImportSource.indexOf(reference) === -1) {
    state.styleId = 0;
    return;
  }
  if (state.styleCache) {
    // 启用缓存，这样开发时，服务端无需对样式进行编译
    const { css, styleId, globalId, elementSelectors } = cache[reference];
    state.css = css;
    state.styleId = styleId;
    state.globalId = globalId;
    state.elementSelectors = elementSelectors;
    if (global.style_cache_tip) {
      global.style_cache_tip = false;
      console.info(chalk.gray('[award-style:cached]\n'));
    }
  } else {
    if (!state.hasParseStyle && (state.styles.global.length || state.styles.jsx.length)) {
      let globalStyle = '';
      let JsxStyle = '';
      let styleId = 0;

      // 读取缓存
      const cacheId = getHashByReference(reference);
      // 读取文件名称
      // global、jsx文件的变更时间
      let filename = '';
      state.styles.jsx.map((item: any, index: number) => {
        filename += fs.statSync(item).mtimeMs;
        state.styles.jsx[index] = {
          from: item
        };
      });

      state.styles.global.map((item: any, index: number) => {
        filename += fs.statSync(item).mtimeMs;
        state.styles.global[index] = {
          from: item
        };
      });
      const newFileName = md5(filename);
      const cacheDir = path.join(constant.CACHE_DIR, newFileName.substr(0, 2));
      if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir);
      }
      const filepath = path.join(cacheDir, cacheId + '-' + newFileName);

      // 设置读取缓存标识
      let readCache = false;
      let paserError = false;

      if (
        fs.existsSync(filepath) &&
        !global.style_hmr &&
        (dev() || process.env.WEB_TYPE === 'WEB_SPA')
      ) {
        readCache = true;
        // 编译读取缓存
        const result = JSON.parse(fs.readFileSync(filepath, 'utf-8'));
        globalStyle = result.globalStyle;
        JsxStyle = result.JsxStyle;
        styleId = result.styleId;

        state.elementSelectors = result.elementSelectors;

        // 创建文件夹
        const images_dir = '/static/images';
        const fonts_dir = '/static/fonts';
        if (!memoryFile.existsSync(images_dir)) {
          memoryFile.mkdirpSync(images_dir);
        }
        if (!memoryFile.existsSync(fonts_dir)) {
          memoryFile.mkdirpSync(fonts_dir);
        }

        // 写文件到内存
        for (const new_src in result.fonts) {
          if (Object.prototype.hasOwnProperty.call(result.fonts, new_src)) {
            const src = result.fonts[new_src];
            if (fs.existsSync(src)) {
              memoryFile.writeFileSync(new_src, fs.readFileSync(src));
            } else {
              readCache = false;
            }
          }
        }
        for (const new_src in result.images) {
          if (Object.prototype.hasOwnProperty.call(result.images, new_src)) {
            const src = result.images[new_src];
            if (fs.existsSync(src)) {
              memoryFile.writeFileSync(new_src, fs.readFileSync(src));
            } else {
              readCache = false;
            }
          }
        }
      }

      // 发现读取缓存失败，或者不需要读取缓存，则走正常解析
      if (!readCache) {
        if (fs.existsSync(cacheDir) && dev()) {
          clean(cacheDir);
          fs.mkdirSync(cacheDir);
        }
        // 解析样式资源
        const result: any = postcssParse(state);
        if (result) {
          globalStyle = result.global;
          JsxStyle = result.jsx;
          styleId = result.styleId;
          if (dev()) {
            fs.writeFileSync(
              filepath,
              JSON.stringify({
                globalStyle,
                JsxStyle,
                styleId,
                elementSelectors: state.elementSelectors,
                fonts: state.fonts,
                images: state.images
              })
            );
          }
        } else {
          paserError = true;
        }
      }

      if (!paserError) {
        state.parserStyleError = false;
        state.hasParseStyle = true;
        state.styleId = styleId;
        state.globalId = globalStyle === '' ? '0' : hashString(globalStyle);
        state.css = globalStyle + JsxStyle;
        // 生产环境，存储资源内容，供award-style的webpack插件调取
        if (!dev()) {
          let _esHash;
          let _styleHash;
          const relateReference = reference.replace(cwd, '');

          const jsxhashFrom: any = [hashString(relateReference)];
          state.styles.jsx.map((item: any) => {
            const from = item.from.replace(cwd, '');
            jsxhashFrom.push(hashString(from));
          });

          const stylehashFrom: any = [hashString(relateReference)];
          state.styles.global.map((item: any) => {
            const from = item.from.replace(cwd, '');
            stylehashFrom.push(hashString(from));
          });

          const uniqueJsxID = Array.from(new Set(quickSort(jsxhashFrom))).join('');
          const uniqueStyleID = Array.from(new Set(quickSort(stylehashFrom))).join('');

          // 资源hash内容 + 引用排序
          _esHash = hashString(JsxStyle + uniqueJsxID);
          _styleHash = hashString(globalStyle + uniqueStyleID);

          // 存放文件引用对应的styleHash值
          // 局部
          global['es-style'].es[relateReference] = '';
          global['es-style'].relation.es.file[relateReference] = _esHash;
          if (!global['es-style'].relation.es.hash[_esHash]) {
            global['es-style'].relation.es.hash[_esHash] = [];
          }
          // 存放es中hash对应的多文件
          global['es-style'].relation.es.hash[_esHash].push(relateReference);

          // 全局
          global['es-style'].style[relateReference] = '';
          global['es-style'].relation.style.file[relateReference] = _styleHash;
          if (!global['es-style'].relation.style.hash[_styleHash]) {
            global['es-style'].relation.style.hash[_styleHash] = [];
          }
          // 存放style中hash对应的多文件
          global['es-style'].relation.style.hash[_styleHash].push(relateReference);

          if (styleIds.indexOf(uniqueJsxID) === -1) {
            // 没有重复的局部样式
            styleIds.push(uniqueJsxID);
            global['es-style'].es[relateReference] = JsxStyle;
          }

          if (state.globalId !== 0 && globalIds.indexOf(uniqueStyleID) === -1) {
            // 没有重复的全局样式
            globalIds.push(uniqueStyleID);
            global['es-style'].style[relateReference] = globalStyle;
          }
        } else {
          // 写入缓存资源信息
          // 分析引用的css资源地址
          const dep: any = {};
          state.styles.jsx.map((item: any) => {
            dep[item.from] = fs.statSync(item.from).mtime.getTime();
          });

          state.styles.global.map((item: any) => {
            dep[item.from] = fs.statSync(item.from).mtime.getTime();
          });

          // 表示需要进行hmr
          global.style_change_hmr = true;
          cache[reference] = {
            css: state.css,
            _scopeId: hashString(state.scopeCSS),
            _globalId: hashString(state.globalCSS),
            styleId: state.styleId,
            globalId: state.globalId,
            elementSelectors: state.elementSelectors,
            dep
          };
        }
      } else {
        if (cache[reference]) {
          const { styleId } = cache[reference];
          state.styleId = styleId;
        }
        state.parserStyleError = true;
      }
    }
  }
};
