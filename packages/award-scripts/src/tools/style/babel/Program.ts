/**
 * 全局import es-style 和处理一些全局的变量
 */
import * as t from '@babel/types';
import tpl from '@babel/template';
import { NodePath } from '@babel/core';
import stringHash = require('string-hash');
import { resolve } from 'path';
import { requireResolve } from '../../help';
import * as fs from 'fs-extra';
import collectSourceInfo from './collectSourceInfo';
import handleStyles from './handleStyles';
import writeStyle from './writeStyle';
import { storeAwardStyle } from '../utils/constant';
import { shouldBeParseStyle, dev } from '../utils';
import { memoryFile } from '../../help';

export default (cache: any) => (path: NodePath<t.Program>, state: any) => {
  const reference = state && state.file && state.file.opts.filename;

  state.styles = {
    global: [],
    jsx: []
  };
  state.styleSourceMap = {};
  state.elementSelectors = [];
  state.css = '';
  state.scopeCSS = '';
  state.globalCSS = '';
  state.styleId = 0;
  state.globalId = 0;
  state.fonts = {};
  state.images = {};
  state.styleCache = !!cache[reference]; // 存储缓存则为true，否则false

  let depNumber = state.styleCache ? Object.keys(cache[reference].dep).length : 0;

  // 收集样式引用集合
  path.traverse({
    ImportDeclaration(_path) {
      let givenPath = _path.node.source.value.replace(/!$/, '');
      if (shouldBeParseStyle(givenPath)) {
        const mod = requireResolve(givenPath, resolve(reference));
        if (!mod || !mod.src) {
          throw new Error(`Path '${givenPath}' could not be found for '${reference}'`);
        }
        givenPath = mod.src;
        // 存储缓存，且存在样式的mtime不一致的资源，需要设置cache为false
        if (state.styleCache) {
          if (cache[reference].dep[givenPath] !== fs.statSync(givenPath).mtime.getTime()) {
            state.styleCache = false;
          }
          if (depNumber > 0) {
            depNumber--;
          }
        }
      }
    },
    JSXElement(_path) {
      if (!t.isJSXIdentifier(_path.node.openingElement.name)) {
        return;
      }
      const name = _path.node.openingElement.name.name;
      if (name === 'award-style') {
        // 判断是否是global
        let isGlobal = false;
        _path.node.openingElement.attributes.map(item => {
          if (t.isJSXAttribute(item) && t.isJSXIdentifier(item.name)) {
            if (item.name.name === 'global') {
              // 全局
              isGlobal = true;
            }
          }
        });
        _path.node.children.forEach(child => {
          if (t.isJSXExpressionContainer(child) && t.isTemplateLiteral(child.expression)) {
            const quasis = child.expression.quasis;
            if (quasis.length > 1) {
              throw new Error('award-style组件内的模板字符串不支持变量');
            } else {
              const v = quasis[0].value.raw;
              if (isGlobal) {
                state.globalCSS += v;
              } else {
                state.scopeCSS += v;
              }
            }
          }
        });
        _path.remove();
      }
    }
  });

  if (depNumber !== 0) {
    state.styleCache = false;
  }

  const _scopeId = stringHash(state.scopeCSS);
  const _globalId = stringHash(state.globalCSS);

  if (cache[reference]) {
    if (_scopeId !== cache[reference]._scopeId) {
      state.styleCache = false;
    }
    if (_globalId !== cache[reference]._globalId) {
      state.styleCache = false;
    }
  }

  // 收集资源引用集合，样式、图片
  path.traverse({
    ImportDeclaration(_path: any) {
      collectSourceInfo(_path, state);
    }
  });

  // 存储award-style内容
  if (state.scopeCSS || state.globalCSS) {
    if (global.ImportSource.indexOf(reference) === -1) {
      global.ImportSource.push(reference);
    }
    if (state.scopeCSS) {
      state.styles.jsx.push(reference);
    }
    if (state.globalCSS) {
      state.styles.global.push(reference);
    }

    if (!state.styleSourceMap[reference]) {
      state.styleSourceMap[reference] = [reference];
    }

    let map: any = {};
    if (memoryFile.existsSync(storeAwardStyle)) {
      map = JSON.parse(memoryFile.readFileSync(storeAwardStyle, 'utf-8'));
    }
    map[reference] = state.scopeCSS + state.globalCSS;
    memoryFile.writeFileSync(storeAwardStyle, JSON.stringify(map));
  }

  // 解析并处理当前组件全部的样式资源
  handleStyles(cache, state);

  // 注入styleId，变更js文件名称
  if (state.styleId) {
    path.node.body.push(
      tpl(`export const AWARDHASH = 0;`)({
        AWARDHASH: t.identifier('_' + String(stringHash(state.css)))
      }) as any
    );
  }

  /**
   * 开发环境特殊处理
   *
   * 1. 将资源写入组件的props
   * 2. 只对当前项目添加award-style组件的导入
   */
  if (dev() && state.css !== '' && !state.styleCache) {
    writeStyle(state);
  }
};
