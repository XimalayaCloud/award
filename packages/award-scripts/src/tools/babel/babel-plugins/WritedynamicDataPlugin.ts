/* eslint-disable max-depth */
/**
 * 通过babel识别award库的模板代码，替换为插件引用
 */

import { NodePath } from '@babel/core';
import * as t from '@babel/types';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';

let awardReg = /\/award\/lib\//;
let awardPlguinReg = /\/award-plugin\/lib\//;
const root = process.cwd();

if (os.type() === 'Windows_NT') {
  awardReg = /\\award\\lib\\/;
  awardPlguinReg = /\\award-plugin\\lib\\/;
}

export default function (babel: any) {
  const { template: tpl } = babel;
  return {
    name: 'WritePlugin',
    visitor: {
      ExpressionStatement(spath: NodePath<t.ExpressionStatement>, state: any) {
        const reference = state?.file?.opts.filename;
        const basename = state?.opts?.basename;
        if (!awardReg.test(reference) && !awardPlguinReg.test(reference)) {
          return;
        }
        if (t.isStringLiteral(spath.node.expression)) {
          const value = spath.node.expression.value;

          if (value === '<$>__AWARD__PLUGINS__<$>') {
            const element = [tpl(`_award_plugins_ = {};`)()];

            for (const plugin in global.__AWARD__PLUGINS__) {
              if (Object.prototype.hasOwnProperty.call(global.__AWARD__PLUGINS__, plugin)) {
                const item = global.__AWARD__PLUGINS__[plugin];
                let pluginName = plugin;
                if (/^\.\//.test(pluginName)) {
                  // 相对路径开头
                  pluginName = path.join(root, pluginName);
                }
                const clientLibrayName = pluginName + '/client';
                const moduleName = '_' + item.name;
                const clientModuleName = '_' + item.name + '_client';
                element.push(
                  tpl(`let MODULENAME,CLIENTMODULENAME`)({
                    MODULENAME: t.identifier(moduleName),
                    CLIENTMODULENAME: t.identifier(clientModuleName)
                  })
                );

                // lib/index.js
                try {
                  if (fs.existsSync(require.resolve(pluginName))) {
                    element.push(
                      // try{}catch(e){} api依赖 require('award-plugin-example')
                      t.tryStatement(
                        t.blockStatement([
                          tpl(`MODULENAME = require(LIBRARYNAME)`)({
                            MODULENAME: t.identifier(moduleName),
                            LIBRARYNAME: t.stringLiteral(pluginName)
                          })
                        ]),
                        t.catchClause(t.identifier('e'), t.blockStatement([]))
                      )
                    );
                  }
                } catch (error) {}

                // lib/client
                try {
                  if (fs.existsSync(require.resolve(clientLibrayName))) {
                    element.push(
                      // try{}catch(e){} client依赖 require('award-plugin-example/client')
                      t.tryStatement(
                        t.blockStatement([
                          tpl(`CLIENTMODULENAME = require(CLIENTLIBRARYNAME)`)({
                            CLIENTMODULENAME: t.identifier(clientModuleName),
                            CLIENTLIBRARYNAME: t.stringLiteral(clientLibrayName)
                          })
                        ]),
                        t.catchClause(t.identifier('e'), t.blockStatement([]))
                      )
                    );
                  }
                } catch (error) {}

                element.push(
                  tpl(`_award_plugins_[LIBRARYNAME] = {
                  name: NAME,
                  default: MODULENAME,
                  client: CLIENTMODULENAME,
                }`)({
                    LIBRARYNAME: t.stringLiteral(plugin),
                    NAME: t.stringLiteral(item.name),
                    MODULENAME: t.identifier(moduleName),
                    CLIENTMODULENAME: t.identifier(clientModuleName)
                  })
                );
              }
            }
            spath.replaceWithMultiple(element);
          }

          if (value === '<$>__AWARD__BASENAME__<$>') {
            if (basename) {
              spath.replaceWith(
                tpl(`webBasename = BASENAME`)({
                  BASENAME: t.stringLiteral(basename)
                })
              );
            } else {
              spath.remove();
            }
          }

          if (value === '<$>__AWARD__STYLE_SCOPE__<$>') {
            const pkg = path.join(process.cwd(), 'package.json');
            let scopes: any[] = [];
            if (fs.existsSync(pkg)) {
              scopes = JSON.parse(String(fs.readFileSync(pkg))).scope || [];
            }
            let elements: any[] = [];
            scopes.forEach((scope) => {
              elements.push(t.stringLiteral(scope));
            });
            spath.replaceWith(
              tpl(`scope = SCOPE`)({
                SCOPE: t.arrayExpression(elements)
              })
            );
          }
        }
      }
    }
  };
}
