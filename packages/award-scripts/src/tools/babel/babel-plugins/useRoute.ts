import { NodePath } from '@babel/core';
import * as t from '@babel/types';

export default function () {
  return {
    name: 'isUseRoute',
    visitor: {
      ImportDeclaration(path: NodePath<t.ImportDeclaration>) {
        let givenPath = path.node.source.value;
        if (/!$/.test(givenPath)) {
          path.remove();
        }
      },
      JSXElement(path: NodePath<t.JSXElement>) {
        if (t.isJSXIdentifier(path.node.openingElement.name)) {
          const name = path.node.openingElement.name.name;
          if (name === 'RouterSwitch') {
            const childrens = path.node.children;
            if (childrens.length) {
              childrens.forEach((item) => {
                if (t.isJSXElement(item)) {
                  if (t.isJSXIdentifier(item.openingElement.name)) {
                    if (item.openingElement.name.name === 'Route') {
                      process.exit(100);
                    }
                  }
                }
              });
            }
          }
        }
      }
    }
  };
}
