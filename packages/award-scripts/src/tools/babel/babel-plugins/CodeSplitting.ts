import { resolve } from 'path';
import hashString = require('string-hash');
import { requireResolve, regNodeModules } from '../../help';

const cwd = process.cwd();

const check = (nodes: any, t: any, routes: any) => {
  nodes.forEach((item: any) => {
    if (t.isJSXElement(item)) {
      if (item.openingElement.name.name !== 'Route') {
        throw new Error('RouterSwitch内的组件必须都是Route');
      } else {
        let component = false;
        let _path = false;
        let _redirect = false;
        let result = 0;
        const props: any = {};
        item.openingElement.attributes.forEach((attr: any) => {
          props[attr.name.name] = attr.value;
          if (t.isJSXExpressionContainer(attr.value)) {
            props[attr.name.name] = attr.value.expression;
          }

          if (attr.value === null) {
            props[attr.name.name] = t.BooleanLiteral(true);
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
          check(item.children, t, childrens);
          const _childrenRoutes: any = [];
          childrens.forEach((children: any) => {
            const obj = [];
            for (const key in children) {
              if (Object.prototype.hasOwnProperty.call(children, key)) {
                obj.push(t.ObjectProperty(t.Identifier(key), children[key]));
              }
            }
            _childrenRoutes.push(t.ObjectExpression(obj));
          });
          props.routes = t.ArrayExpression(_childrenRoutes);
        }

        routes.push(props);
      }
    }
  });
};

const splitting = (childrens: any, state: any, t: any, tpl: any) => {
  const reference = state && state.file && state.file.opts.filename;
  const isServer = state && state.opts && state.opts.isServer;
  const ts = state && state.opts && state.opts.ts;
  const subprocess = state && state.opts && state.opts.subprocess;
  if (childrens.length) {
    childrens.forEach((item: any) => {
      if (t.isJSXElement(item)) {
        if (item.openingElement.name.name === 'Route') {
          const attrs = item.openingElement.attributes;
          let sync = false;
          attrs.forEach((_item: any) => {
            if (_item.name.name === 'sync') {
              sync = true;
            }
          });
          attrs.forEach((_item: any) => {
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
                        t.JSXAttribute(
                          t.JSXIdentifier('__award__file__'),
                          t.StringLiteral(String(hashString(mod.src.replace(cwd, ''))))
                        )
                      );
                    }
                    if (isServer && ts && !state.hasImport[name]) {
                      state.hasImport[name] = true;
                      state.path.node.body.push(
                        tpl(`/**/const NAME = require(SOURCE).default`)({
                          NAME: t.Identifier(name),
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
                          NAME: t.Identifier(name),
                          SOURCE: t.stringLiteral(source),
                          IMPORT: t.Import()
                        })
                      );
                    }
                  } catch (error) {}
                } else {
                  // 不是import引入，说明是当前js引用的变量
                  // 标记props同步
                  item.openingElement.attributes.push(t.JSXAttribute(t.JSXIdentifier('sync')));
                }
              } else {
                // 组件引用, FunctionExpression, ArrowFunctionExpression
                if (t.isFunctionExpression || t.isArrowFunctionExpression) {
                  // 标记props同步
                  item.openingElement.attributes.push(t.JSXAttribute(t.JSXIdentifier('sync')));
                }
              }
            }
          });
          if (subprocess) {
            process.exit(0);
          }
          if (item.children.length) {
            splitting(item.children, state, t, tpl);
          }
        }
      }
    });
  }
};

// https://github.com/jamiebuilds/babel-handbook/blob/master/translations/zh-Hans/plugin-handbook.md#-%E6%8F%92%E4%BB%B6%E7%9A%84%E5%87%86%E5%A4%87%E5%92%8C%E6%94%B6%E5%B0%BE%E5%B7%A5%E4%BD%9C
export default function(babel: any) {
  const { types: t, template: tpl } = babel;
  return {
    name: 'CodeSplitting',
    visitor: {
      Program: {
        enter(_path: any, state: any) {
          const reference = state && state.file && state.file.opts.filename;
          if (regNodeModules.test(reference)) {
            return;
          }
          const isServer = state && state.opts && state.opts.isServer;
          state.path = _path;
          let exitRoutes = false;
          _path.traverse({
            ImportDeclaration(path: any) {
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
            JSXElement(path: any) {
              if (path.node.openingElement.name.name === 'RouterSwitch' && !exitRoutes) {
                exitRoutes = true;
                /**
                 * 代码拆分
                 */
                splitting(path.node.children, state, t, tpl);

                /**
                 * 收集路由表
                 */
                const routes: any = [];
                const _routes: any = [];

                // 这里要递归查找children
                check(path.node.children, t, routes);

                routes.forEach((item: any) => {
                  const obj = [];

                  for (const key in item) {
                    if (Object.prototype.hasOwnProperty.call(item, key)) {
                      obj.push(t.ObjectProperty(t.Identifier(key), item[key]));
                    }
                  }

                  _routes.push(t.ObjectExpression(obj));
                });
                path.node.children = [
                  t.JSXElement(
                    t.JSXOpeningElement(t.JSXIdentifier('p'), []),
                    t.JSXClosingElement(t.JSXIdentifier('p')),
                    [t.JSXText('路由出错了...')]
                  )
                ];

                if (isServer) {
                  _path.node.body.push(
                    tpl(`global.__AWARD__INIT__ROUTES__ = INIT`)({
                      INIT: t.ArrayExpression(_routes),
                      __AWARD__INIT__ROUTES__: t.Identifier('__AWARD__INIT__ROUTES__')
                    })
                  );
                } else {
                  _path.node.body.push(
                    tpl(`window.__AWARD__INIT__ROUTES__ = INIT`)({
                      INIT: t.ArrayExpression(_routes),
                      __AWARD__INIT__ROUTES__: t.Identifier('__AWARD__INIT__ROUTES__')
                    })
                  );
                }
              }
            }
          });
        }
      }
    }
  };
}
