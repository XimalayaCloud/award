import { resolve } from 'path';
import hashString = require('string-hash');
import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import { requireResolve, regNodeModules } from '../../help';

const cwd = process.cwd();

const check = (
  nodes: (t.JSXElement | t.JSXFragment | t.JSXExpressionContainer | t.JSXSpreadChild | t.JSXText)[],
  routes: any
) => {
  nodes.forEach(item => {
    if (t.isJSXElement(item) && t.isJSXIdentifier(item.openingElement.name)) {
      if (item.openingElement.name.name !== 'Route') {
        throw new Error('RouterSwitch内的组件必须都是Route');
      } else {
        let component = false;
        let _path = false;
        let _redirect = false;
        let result = 0;
        const props: any = {
          __award__spread__: []
        };
        item.openingElement.attributes.forEach(attr => {
          if (t.isJSXAttribute(attr)) {
            if (t.isJSXIdentifier(attr.name)) {
              if (attr.name.name === '__award__spread__') {
                let value: any = attr.value;
                if (t.isJSXExpressionContainer(attr.value)) {
                  value = attr.value.expression;
                }

                if (attr.value === null) {
                  value = t.booleanLiteral(true);
                }

                props.__award__spread__.push({ type: 1, value });
              } else {
                props[attr.name.name] = attr.value;
                if (t.isJSXExpressionContainer(attr.value)) {
                  props[attr.name.name] = attr.value.expression;
                }

                if (attr.value === null) {
                  props[attr.name.name] = t.booleanLiteral(true);
                }

                if (attr.name.name === 'component' && !component) {
                  component = true;
                  result = result + 5;
                }

                if (attr.name.name === 'path' && !_path) {
                  _path = true;
                  result = result + 1;
                }

                if (attr.name.name === 'redirect' && !_redirect) {
                  _redirect = true;
                  result = result + 3;
                }
              }
            }
          }

          if (t.isJSXSpreadAttribute(attr)) {
            props.__award__spread__.push({
              type: 2,
              value: attr.argument
            });
          }
        });

        /**
         * path redirect component
         * 1 3 5
         * path、redirect 1+3 = 4
         * path、component 1+5 = 6
         * component 5
         * redirect  3
         * path、redirect、component 1+3+5 = 9
         */
        if ([3, 4, 5, 6, 9].indexOf(result) === -1) {
          throw new Error(
            `Route组件接收的props【"path"、"component"、"redirect"】有如下组合
            且必须设置props
        1. <Route path="" redirect="" />
        2. <Route path="" component={} />
        3. <Route component={} />
        4. <Route redirect="" />
        5. <Route path="" component={} redirect="">`
          );
        }
        if (item.children.length) {
          const childrens: any = [];
          check(item.children, childrens);
          const _childrenRoutes: any = [];
          childrens.forEach((children: any) => {
            const obj = [];
            for (const key in children) {
              if (Object.prototype.hasOwnProperty.call(children, key)) {
                if (key === '__award__spread__') {
                  (children[key] as Array<any>).map(spread => {
                    if (spread.type === 1) {
                      obj.push(t.objectProperty(t.identifier(key), spread.value));
                    }
                    if (spread.type === 2) {
                      obj.push(t.spreadElement(spread.value));
                    }
                  });
                } else {
                  obj.push(t.objectProperty(t.identifier(key), children[key]));
                }
              }
            }
            _childrenRoutes.push(t.objectExpression(obj));
          });
          props.routes = t.arrayExpression(_childrenRoutes);
        }

        routes.push(props);
      }
    }
  });
};

const splitting = (
  childrens: (
    | t.JSXElement
    | t.JSXFragment
    | t.JSXExpressionContainer
    | t.JSXSpreadChild
    | t.JSXText
  )[],
  state: any,
  tpl: any
) => {
  const reference = state && state.file && state.file.opts.filename;
  const isServer = state && state.opts && state.opts.isServer;
  const ts = state && state.opts && state.opts.ts;
  const subprocess = state && state.opts && state.opts.subprocess;
  if (childrens.length) {
    childrens.forEach(item => {
      if (t.isJSXElement(item) && t.isJSXIdentifier(item.openingElement.name)) {
        if (item.openingElement.name.name === 'Route') {
          const attrs = item.openingElement.attributes;
          let sync = false;
          attrs.forEach(_item => {
            if (t.isJSXAttribute(_item) && t.isJSXIdentifier(_item.name)) {
              if (_item.name.name === 'sync') {
                sync = true;
              }
            }
          });
          attrs.forEach(_item => {
            if (t.isJSXAttribute(_item) && t.isJSXIdentifier(_item.name)) {
              if (_item.name.name === 'component' && t.isJSXExpressionContainer(_item.value)) {
                if (t.isIdentifier(_item.value.expression)) {
                  // 组件引用是变量
                  const name = _item.value.expression.name;

                  if (state.import[name]) {
                    try {
                      const _path_ = state.import[name];
                      const source = _path_.node.source.value;
                      const mod = requireResolve(source, resolve(reference));

                      if (!mod || !mod.src) {
                        throw new Error(`Path '${source}' could not be found for '${reference}'`);
                      }
                      // 服务端
                      if (isServer && !sync) {
                        item.openingElement.attributes.push(
                          t.jsxAttribute(
                            t.jsxIdentifier('__award__file__'),
                            t.stringLiteral(String(hashString(mod.src.replace(cwd, ''))))
                          )
                        );
                      }
                      if (isServer && ts && !state.hasImport[name]) {
                        state.hasImport[name] = true;
                        state.path.node.body.push(
                          tpl(`/**/const NAME = require(SOURCE).default`)({
                            NAME: t.identifier(name),
                            SOURCE: t.stringLiteral(source)
                          })
                        );
                      }

                      // 客户端代码，且非同步
                      if (!isServer && !sync && !state.hasImport[name]) {
                        state.hasImport[name] = true;
                        global.routeFileNames.push(mod.src.replace(cwd, ''));
                        _path_.replaceWith(
                          tpl(
                            `const NAME = (cb)=>{
                            return IMPORT(SOURCE).then( async (component) => {
                              // 提前加载当前bundle里面的异步引用
                              const Loadable = require('react-loadable');
                              await Loadable.preloadReady();
                              cb(component);
                            }).catch(err=>{
                              throw err
                            })
                          }`
                          )({
                            NAME: t.identifier(name),
                            SOURCE: t.stringLiteral(source),
                            IMPORT: t.import()
                          })
                        );
                      }
                    } catch (error) {}
                  } else {
                    // 不是import引入，说明是当前js引用的变量
                    // 标记props同步
                    item.openingElement.attributes.push(t.jsxAttribute(t.jsxIdentifier('sync')));
                  }
                } else {
                  // 组件引用, FunctionExpression, ArrowFunctionExpression
                  if (t.isFunctionExpression || t.isArrowFunctionExpression) {
                    // 标记props同步
                    item.openingElement.attributes.push(t.jsxAttribute(t.jsxIdentifier('sync')));
                  }
                }
              }
            }
          });
          if (subprocess) {
            process.exit(0);
          }
          if (item.children.length) {
            splitting(item.children, state, tpl);
          }
        }
      }
    });
  }
};

// https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#-%E6%8F%92%E4%BB%B6%E7%9A%84%E5%87%86%E5%A4%87%E5%92%8C%E6%94%B6%E5%B0%BE%E5%B7%A5%E4%BD%9C
export default function(babel: any) {
  const { template: tpl } = babel;
  return {
    name: 'CodeSplitting',
    visitor: {
      Program: {
        enter(_path: NodePath<t.Program>, state: any) {
          const reference = state && state.file && state.file.opts.filename;
          if (regNodeModules.test(reference)) {
            return;
          }
          const isServer = state && state.opts && state.opts.isServer;
          state.path = _path;
          let exitRoutes = false;
          _path.traverse({
            ImportDeclaration(path) {
              const specifiers = path.node.specifiers;

              if (
                specifiers &&
                specifiers.length === 1 &&
                t.isImportDefaultSpecifier(specifiers[0])
              ) {
                const name = specifiers[0].local.name;

                if (!state.import) {
                  state.import = {};
                }

                state.import[name] = path;
              }

              state.hasImport = {};
            },
            JSXElement(path) {
              if (t.isJSXIdentifier(path.node.openingElement.name)) {
                if (path.node.openingElement.name.name === 'RouterSwitch' && !exitRoutes) {
                  exitRoutes = true;
                  /**
                   * 代码拆分
                   */
                  splitting(path.node.children, state, tpl);

                  /**
                   * 收集路由表
                   */
                  const routes: any = [];
                  const _routes: any = [];

                  // 这里要递归查找children
                  check(path.node.children, routes);

                  routes.forEach((item: any) => {
                    const obj = [];

                    for (const key in item) {
                      if (Object.prototype.hasOwnProperty.call(item, key)) {
                        if (key === '__award__spread__') {
                          (item[key] as Array<any>).map(spread => {
                            if (spread.type === 1) {
                              obj.push(t.objectProperty(t.identifier(key), spread.value));
                            }
                            if (spread.type === 2) {
                              obj.push(t.spreadElement(spread.value));
                            }
                          });
                        } else {
                          obj.push(t.objectProperty(t.identifier(key), item[key]));
                        }
                      }
                    }
                    _routes.push(t.objectExpression(obj));
                  });

                  path.node.children = [
                    t.jsxElement(
                      t.jsxOpeningElement(t.jsxIdentifier('p'), []),
                      t.jsxClosingElement(t.jsxIdentifier('p')),
                      [t.jsxText('路由出错了...')],
                      false
                    )
                  ];

                  if (isServer) {
                    _path.node.body.push(
                      tpl(`global.__AWARD__INIT__ROUTES__ = INIT`)({
                        INIT: t.arrayExpression(_routes),
                        __AWARD__INIT__ROUTES__: t.identifier('__AWARD__INIT__ROUTES__')
                      })
                    );
                  } else {
                    _path.node.body.push(
                      tpl(`window.__AWARD__INIT__ROUTES__ = INIT`)({
                        INIT: t.arrayExpression(_routes),
                        __AWARD__INIT__ROUTES__: t.identifier('__AWARD__INIT__ROUTES__')
                      })
                    );
                  }
                }
              }
            }
          });
        }
      }
    }
  };
}
