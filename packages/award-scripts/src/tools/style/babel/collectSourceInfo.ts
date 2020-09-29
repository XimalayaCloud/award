/* eslint-disable complexity */
/**
 * 检测import内容,同时通过sass获取style内容
 */

import { resolve, join } from 'path';
import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { shouldBeParseStyle, shouldBeParseImage } from '../utils';
import parseImage from '../utils/parse-image';
import { requireResolve } from '../../help';
import Config from '../utils/config';

const config = Config();
const cwd = process.cwd();

export default (path: NodePath<t.ImportDeclaration>, state: any) => {
  let givenPath = path.node.source.value;
  const reference = state?.file?.opts.filename;
  let imageOptions = state?.opts?.imageOptions;
  const publicPath = state?.opts?.publicPath || '/';
  const publicEntry = state?.opts?.publicEntry || './dist';
  const write = state?.opts?.write || false;

  // 全局的引用 './common.scss!'
  let globalStyle = false;
  if (/!$/.test(givenPath)) {
    globalStyle = true;
    givenPath = givenPath.replace(/!$/, '');
  }

  if (!state.importStyle) {
    state.importStyle = false; // 引用样式
  }

  // 引用样式
  if (shouldBeParseStyle(givenPath)) {
    path.node.specifiers = [];
    state.importStyle = true;
    if (global.ImportSource.indexOf(reference) === -1) {
      global.ImportSource.push(reference);
    }

    // @符号开头的样式资源引用
    if (/^@\//.test(givenPath)) {
      givenPath = join(cwd, givenPath.replace(/^@\//, ''));
    } else {
      givenPath = requireResolve(givenPath, resolve(reference)).src;
    }

    if (!state.styleSourceMap[givenPath]) {
      state.styleSourceMap[givenPath] = [reference];
    } else {
      if (state.styleSourceMap[givenPath].indexOf(reference) === -1) {
        state.styleSourceMap[givenPath].push(reference);
      } else {
        return path.remove();
      }
    }

    if (state.styleCache) {
      return path.remove();
    }

    // 需要做当前jsx的解析工作
    if (globalStyle) {
      state.styles.global.push(givenPath);
    } else {
      state.styles.jsx.push(givenPath);
    }
    path.remove();
  }

  // 引用图片
  if (shouldBeParseImage(givenPath)) {
    if (path.node.specifiers.length === 1 && t.isImportDefaultSpecifier(path.node.specifiers[0])) {
      if (typeof imageOptions === 'undefined') {
        imageOptions = {};
      }

      if (config.limit) {
        imageOptions.limit = config.limit;
      }

      const id = path.node.specifiers[0].local.name;

      const _content: any = parseImage({
        url: givenPath,
        reference,
        write,
        imageOptions,
        publicEntry,
        publicPath,
        state
      });

      const variable = t.variableDeclarator(t.identifier(id), t.stringLiteral(_content));

      (path as any).replaceWith({
        type: 'VariableDeclaration',
        kind: 'const',
        declarations: [variable],
        leadingComments: [
          {
            type: 'CommentBlock',
            value: `award-style '${givenPath}' `
          }
        ]
      });
    }
  }

  if (!state.importStyle) {
    const index = global.ImportSource.indexOf(reference);
    if (index !== -1) {
      global.ImportSource.splice(index, 1);
    }
  }
};
