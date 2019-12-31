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

import { shouldBeParseStyle, dev } from '../utils';

export default (cache: any) => (path: NodePath<t.Program>, state: any) => {
  const reference = state && state.file && state.file.opts.filename;

  state.styles = {
    global: [],
    jsx: []
  };
  state.elementSelectors = [];
  state.css = '';
  state.scopeCSS = '';
  state.styleId = 0;
  state.globalId = 0;
  state.fonts = {};
  state.images = {};
  state.styleCache = !!cache[reference]; // 存储缓存则为true，否则false

  let depNumber = state.styleCache ? Object.keys(cache[reference].dep).length : 0;

  // 收集样式引用集合
  path.traverse({
    ImportDeclaration(_path: any) {
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
    JSXElement(_path: NodePath<t.JSXElement>) {
      if (!t.isJSXIdentifier(_path.node.openingElement.name)) {
        return;
      }
      const name = _path.node.openingElement.name.name;
      if (name === 'award-style') {
        _path.node.children.forEach(child => {
          if (t.isJSXExpressionContainer(child) && t.isTemplateLiteral(child.expression)) {
            const quasis = child.expression.quasis;
            if (quasis.length > 1) {
              throw new Error('award-style组件内的模板字符串不支持变量');
            } else {
              state.scopeCSS += quasis[0].value.raw;
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

  const scopeId = stringHash(state.scopeCSS);
  if (cache[reference]) {
    if (scopeId !== cache[reference].scopeId) {
      state.styleCache = false;
    }
  }

  // 收集资源引用集合，样式、图片
  path.traverse({
    ImportDeclaration(_path: any) {
      collectSourceInfo(_path, state);
    }
  });

  if (state.scopeCSS) {
    if (global.ImportSource.indexOf(reference) === -1) {
      global.ImportSource.push(reference);
    }
    state.styles.jsx.push(reference);
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
