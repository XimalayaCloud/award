/**
 * 给所有的jsx节点插入styleId来进行唯一性的区分
 */

import * as t from '@babel/types';
import { NodePath } from '@babel/core';

const concat = (a: any, b: any) => t.binaryExpression('+', a, b);

export default (path: NodePath<t.JSXOpeningElement>, state: any) => {
  // 移除es-style标签
  if (t.isJSXIdentifier(path.node.name) && path.node.name.name === 'es-style') {
    return path.parentPath.remove();
  }
  const styleId = state.styleId;
  let isExistclassName = false;
  let isExistId = false;

  if (styleId === 0) {
    return;
  }

  if (path.node.attributes.length) {
    path.node.attributes.forEach((item: any) => {
      // 找出当前属性的className，对其进行追加styleId
      if (t.isJSXAttribute(item) && t.isJSXIdentifier(item.name)) {
        if (item.name.name === 'className') {
          // 值为{}
          if (t.isJSXExpressionContainer(item.value)) {
            item.value = t.jsxExpressionContainer(
              concat(item.value.expression, t.stringLiteral(' ' + styleId))
            );
          }

          // 值是字符串
          if (t.isStringLiteral(item.value)) {
            item.value = t.jsxExpressionContainer(
              concat(item.value, t.stringLiteral(' ' + styleId))
            );
          }

          isExistclassName = true;
        }

        if (item.name.name === 'id') {
          isExistId = true;
        }
      }
    });
  }

  // 不存在className且JSXElement是一个html元素组件
  if (
    !isExistclassName &&
    t.isJSXIdentifier(path.node.name) &&
    path.node.name.name.charAt(0) !== path.node.name.name.charAt(0).toUpperCase()
  ) {
    if (isExistId || state.elementSelectors.indexOf(path.node.name.name) !== -1) {
      path.node.attributes.push(
        t.jsxAttribute(t.jsxIdentifier('className'), t.stringLiteral(styleId))
      );
    }
  }
};
