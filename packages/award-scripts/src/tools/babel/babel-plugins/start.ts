import { regNodeModules } from '../../help';

function convertString(obj: any) {
  var res: any = [];
  for (const key in obj) {
    const item = obj[key];
    if (typeof item == 'string') {
      const _item = Number.isNaN(Number(item)) ? '"' + item + '"' : Number(item);
      res.push((Array.isArray(obj) ? '' : '"' + key + '"' + ':') + _item + '');
    } else if (typeof item == 'object') {
      res.push((Array.isArray(obj) ? '' : '"' + key + '"' + ':') + convertString(item));
    } else if (typeof item === 'function') {
      const isFun = !/=>|function/.test(item.toString());
      res.push((Array.isArray(obj) || isFun ? '' : '"' + key + '"' + ':') + item);
    } else {
      res.push((Array.isArray(obj) ? '' : '"' + key + '"' + ':') + item);
    }
  }

  res = res.join(',');
  if (Array.isArray(obj)) {
    return '[' + res + ']';
  } else if (typeof obj == 'object') {
    return '{' + res + '}';
  } else {
    return res;
  }
}

/* eslint-disable array-callback-return */
const replaceWith = (tpl: any, callee: any, expression: any, state: any, t: any) => {
  if (expression.arguments.length === 1) {
    expression.arguments.push(t.NullLiteral());
  }
  expression.arguments.push(createOptions(state, tpl));
  const dev = state && state.opts && state.opts.dev;
  if (dev) {
    return tpl(`(function(){
    START(ARGU)(Component => {
      const { hot } = require('react-hot-loader/root');
      hot(Component);
    })
   })()`)({
      START: callee,
      ARGU: expression.arguments
    });
  } else {
    return tpl(`(function(){
    START(ARGU)
   })()`)({
      START: callee,
      ARGU: expression.arguments
    });
  }
};

/**
 * 将Award配置的插件注入到客户端代码里面去
 */
const createOptions = (state: any, tpl: any) => {
  const plugins = state && state.opts && state.opts.plugins;
  let options = tpl(`var a = {plugins:[]}`)();
  if (plugins) {
    options = tpl(`var a = {plugins:${convertString(plugins)}}`)();
  }
  return options.declarations[0].init;
};

const handleStartExpression = (path: any, state: any, tpl: any, t: any, isDefault = false) => {
  const reference = state && state.file && state.file.opts.filename;
  if (regNodeModules.test(reference)) {
    return;
  }
  if (!state.defaultSpec && !state.importSpec) {
    return;
  }
  if (state.hasHandle) {
    return;
  }
  const expression = isDefault ? path.node.declaration : path.node.expression;
  if (expression && t.isCallExpression(expression)) {
    const callee = expression.callee;

    if (state.defaultSpec && t.isMemberExpression(callee)) {
      const obj = callee.object;
      if (t.isIdentifier(obj)) {
        if (obj.name === state.defaultSpec) {
          state.hasHandle = true;
          path.replaceWith(replaceWith(tpl, callee, expression, state, t));
        }
      }
    }

    if (
      state.importSpec &&
      t.isIdentifier(callee) &&
      state.importSpec.indexOf(callee.name) !== -1
    ) {
      state.hasHandle = true;
      path.replaceWith(replaceWith(tpl, callee, expression, state, t));
    }
  }
};

/**
 * start方法扩展
 *
 * 需兼容函数式、类名、装饰器等
```js
start()(Component=>{
  const { hot } = require('react-hot-loader/root');
  hot(Component);
})
 ```
 */
export default (babel: any) => {
  const { types: t, template: tpl } = babel;
  return {
    name: 'start',
    visitor: {
      Program(path: any, state: any) {
        state.defaultSpec = null;
        state.importSpec = [];
        path.traverse({
          ImportDeclaration(_path: any) {
            const reference = state && state.file && state.file.opts.filename;
            if (regNodeModules.test(reference)) {
              return;
            }
            const source = _path.node.source;
            if (t.isStringLiteral(source) && source.value === 'award') {
              const spec = _path.node.specifiers;
              spec.map((item: any) => {
                if (t.isImportDefaultSpecifier(item)) {
                  state.defaultSpec = item.local.name;
                } else if (t.isImportSpecifier(item)) {
                  if (item.imported.name === 'start') {
                    state.importSpec.push(item.local.name);
                  }
                }
              });
            }
          },
          ExportDefaultDeclaration(_path: any) {
            handleStartExpression(_path, state, tpl, t, true);
          }
        });
      },
      ClassDeclaration(path: any, state: any) {
        const reference = state && state.file && state.file.opts.filename;
        if (regNodeModules.test(reference)) {
          return;
        }
        const decorators = path.node.decorators;
        let myExpression = null;
        const classId = path.node.id.name;
        if (decorators) {
          decorators.map((item: any, index: any) => {
            const expression = item.expression;
            if (t.isMemberExpression(expression) && expression.object.name === state.defaultSpec) {
              myExpression = expression;
              path.node.decorators.splice(index, 1);
            } else if (t.isIdentifier(expression)) {
              if (state.importSpec.indexOf(expression.name) !== -1) {
                myExpression = expression;
                path.node.decorators.splice(index, 1);
              }
            }
          });

          if (myExpression) {
            const dev = state && state.opts && state.opts.dev;
            if (dev) {
              path.parent.body.push(
                tpl(`EXP(ID, null, OPTIONS)(Component => {
                const { hot } = require('react-hot-loader/root');
                hot(Component);
              })`)({
                  EXP: myExpression,
                  ID: classId,
                  OPTIONS: createOptions(state, tpl)
                })
              );
            } else {
              path.parent.body.push(
                tpl(`EXP(ID, null, OPTIONS)`)({
                  EXP: myExpression,
                  ID: classId,
                  OPTIONS: createOptions(state, tpl)
                })
              );
            }
          }
        }
      },
      ExpressionStatement(path: any, state: any) {
        handleStartExpression(path, state, tpl, t);
      }
    }
  };
};
