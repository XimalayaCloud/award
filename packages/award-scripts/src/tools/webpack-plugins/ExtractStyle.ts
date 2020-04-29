/**
 * 提取award-style的所有样式资源
 */
/* eslint-disable guard-for-in */
/* eslint-disable array-callback-return */
/* eslint-disable no-loop-func */
/* eslint-disable max-nested-callbacks */
import * as webpack from 'webpack';
import hashString = require('string-hash');
import * as md5 from 'md5';
import * as CleanCSS from 'clean-css';
import { quickSort, regNodeModules } from '../help';

const dev = () =>
  process.env.NODE_ENV === 'development' || typeof process.env.NODE_ENV === 'undefined';

const { Template }: any = webpack;
const pluginName = 'EsStyleWebpackPlugin';
const cwd = process.cwd();

const cleanStyle = (css: any) => {
  const output = new CleanCSS({}).minify(css);
  return output.styles;
};

class Plugin {
  private entry: any;

  public constructor(entry: any) {
    // 判断是否合并所有样式
    this.entry = entry;
  }

  public apply(compiler: any) {
    // 记录每个chunk对应的css module
    let MyChunks: any = {};
    let CommonStyle = '';
    // 记录公共的chunk css module
    let CommonChunkCssModule: any = [];
    // 记录公共样式的hash名字，通过hash名字排序拼接style
    let CommonFileHashName: any = {};
    let _chunks: any = [];
    let SplitStyleModules: any = [];
    const Splitdeps: any = {};
    if (dev()) {
      return;
    }

    compiler.hooks.thisCompilation.tap(pluginName, (compilation: any) => {
      compilation.hooks.afterChunks.tap(pluginName, (chunks: any) => {
        _chunks = [];
        const depAll: any = {};
        chunks.forEach((item: any) => {
          const dep = [];
          const reasons = (Array.from(item._modules)[0] as any).reasons;
          for (const myModule of item.modulesIterable) {
            if (myModule.resource && !regNodeModules.test(myModule.resource)) {
              // 当前模块存在样式
              dep.push(myModule.resource.replace(cwd, ''));
            }
          }
          if (reasons) {
            const myModule = reasons[0].module;
            if (myModule) {
              const name = myModule.resource.replace(cwd, '');
              depAll[name] = [...(depAll[name] || []), ...dep];
            }
          }

          // 提取依赖入口
          for (const myModule of item.modulesIterable) {
            if (myModule.resource && !regNodeModules.test(myModule.resource)) {
              // 当前模块存在样式
              _chunks.push(myModule.resource.replace(cwd, ''));
              break;
            }
          }
        });

        const _dd = (key: any, deps: any) => {
          const _d = depAll[key];
          if (_d && _d.length) {
            _d.forEach((item: any) => {
              if (global.routeFileNames.indexOf(item) === -1) {
                SplitStyleModules.push(item);
                deps.push(item);
                _dd(item, deps);
              }
            });
          }
        };

        /**
         *
        ```json
          { '/index.js':
            [
              '/app.js',
              '/app.bak.js',
              '/routes.js'
            ],
            '/home.js':
            [
              '/home.bak.js'
            ]
          }
        ```
         */
        for (let key in depAll) {
          if (global.routeFileNames.indexOf(key) !== -1) {
            Splitdeps[key] = [];
            _dd(key, Splitdeps[key]);
          }
        }
      });

      // 整理chunk以及其依赖的模块之间的关系，通过模块依赖的关系找到依赖的css资源
      compilation.hooks.afterOptimizeChunkIds.tap(pluginName, (chunks: any) => {
        MyChunks = {};
        CommonStyle = '';
        CommonChunkCssModule = [];
        CommonFileHashName = {};
        const mainChunkModules: any = [];
        const moduleEntry: any = []; // 每个chunk的入口文件，都是依赖的第一个文件
        chunks.forEach((item: any) => {
          const modules: any = [];
          let entry = null;
          for (const myModule of item.modulesIterable) {
            if (myModule.resource && !regNodeModules.test(myModule.resource)) {
              // 当前模块存在样式
              const name = myModule.resource.replace(cwd, '');
              if (global.routeFileNames.indexOf(name) !== -1) {
                entry = name;
              } else {
                modules.push(name);
              }
            }
          }

          if (entry) {
            const hasBundle: any = [];
            _chunks.forEach((chunkEntry: any) => {
              if (modules.indexOf(chunkEntry) !== -1) {
                hasBundle.push(hashString(chunkEntry));
              }
            });

            // 移出入口
            modules.shift();
            moduleEntry.push(entry);

            MyChunks[item.debugId] = {
              id: item.id,
              entry,
              modules,
              name: item.name,
              'hash-bundle': hasBundle
            };
          }
        });

        // 去除重复的bundle依赖
        // 同时可以提取公共依赖 >= 2
        const CommonModule: any = {};
        // eslint-disable-next-line guard-for-in
        for (const debugId in MyChunks) {
          const _modules: any = [];
          const item = MyChunks[debugId];
          if (item.modules.length) {
            // eslint-disable-next-line no-loop-func
            item.modules.forEach((_module: any) => {
              // 表示非入口的模块
              if (moduleEntry.indexOf(_module) === -1) {
                if (CommonModule[_module]) {
                  if (CommonChunkCssModule.indexOf(_module) === -1) {
                    // 说明已经存在该module了,需要将该module存入公共的css module
                    // 剔除当前模块没有import样式
                    CommonChunkCssModule.push(_module);
                  }
                } else {
                  CommonModule[_module] = debugId;
                }
                _modules.push(_module);
              }
            });
          }
          MyChunks[debugId].modules = _modules;
        }

        // 去除MyChunks里面 公共的module
        // 同时提取每个chunk的样式
        // eslint-disable-next-line guard-for-in
        for (const debugId in MyChunks) {
          const _modules: any = [];
          const item = MyChunks[debugId];
          const css: any = {};
          let cssKeys: any = [];
          if (global['es-style'] && global['es-style'].es[item.entry]) {
            if (item.name === 'main') {
              // 把main入口的资源也提取到公共模块中
              CommonFileHashName[0] = global['es-style'].es[item.entry];
            } else {
              const entryId = hashString(item.entry);
              cssKeys.push(entryId);
              css[entryId] = global['es-style'].es[item.entry];
            }
          }
          if (item.modules.length) {
            item.modules.map((_module: any) => {
              // 剔除提取的公共模块
              if (CommonChunkCssModule.indexOf(_module) === -1) {
                // 剔除当前模块没有import样式
                if (global['es-style'] && global['es-style'].es[_module]) {
                  /**
                   * 当前模块不在公共模块内
                   * 但是当前模块引用的样式被公共模块也引用了
                   * 后续该样式会被公共模块提取到全局样式库中
                   * 所以，该模块的样式不加入该模块中
                   */
                  const hashId = global['es-style'].relation.es.file[_module];
                  const relations = global['es-style'].relation.es.hash[hashId];
                  _modules.push(_module);

                  if (item.name === 'main') {
                    // 把main入口的资源也提取到公共模块中
                    let keys: any = [];
                    relations.map((item: any) => {
                      keys.push(hashString(item));
                    });
                    keys = Array.from(new Set(quickSort(keys)));

                    if (!CommonFileHashName[keys[0]]) {
                      CommonFileHashName[keys[0]] = global['es-style'].es[_module];
                    }
                  } else {
                    let isGlobal = false;
                    relations.map((item: any) => {
                      if (CommonChunkCssModule.indexOf(item) !== -1 && item !== _module) {
                        isGlobal = true;
                      }
                    });
                    if (!isGlobal) {
                      // 如果不是全局，则吧样式放到当前的chunk下
                      const _moduleId = hashString(_module);
                      cssKeys.push(_moduleId);
                      css[_moduleId] = global['es-style'].es[_module];
                    }
                  }
                }
                if (
                  item.name === 'main' &&
                  global['es-style'] &&
                  global['es-style'].style[_module]
                ) {
                  mainChunkModules.push(_module);
                }
              }
            });
          }

          // 排序cssKeys计算叠加
          cssKeys = Array.from(new Set(quickSort(cssKeys)));
          let ChunkStyle = '';

          cssKeys.map((key: any) => {
            ChunkStyle += css[key];
          });

          MyChunks[debugId]._modules = item.modules;
          MyChunks[debugId].modules = _modules;
          MyChunks[debugId].style = ChunkStyle;
        }

        // es
        CommonChunkCssModule.map((item: any) => {
          const hashId = global['es-style'].relation.es.file[item];
          // hashId存在，同时不等于5381 5381=hashString('')
          if (hashId && hashId !== 5381) {
            const relations = global['es-style'].relation.es.hash[hashId];

            let keys: any = [];
            let _style = '';

            // 获取当前hash依赖的js文件，然后进行排序
            relations.map((item: any) => {
              keys.push(hashString(item));
              if (global['es-style'].es[item]) {
                _style = global['es-style'].es[item];
              }
            });
            // 取出第一个js
            keys = Array.from(new Set(quickSort(keys)));

            if (!CommonFileHashName[keys[0]] && _style) {
              CommonFileHashName[keys[0]] = _style;
            }
          }
        });

        // style
        const _CommonFileHashName: any = {};
        if (global['es-style'] && global['es-style'].style) {
          // 获取全局的公共file名称
          const commonStyleReference = Object.keys(global['es-style'].style);
          commonStyleReference.map(item => {
            const hashId = global['es-style'].relation.style.file[item];
            const relations = global['es-style'].relation.style.hash[hashId];
            let keys: any = [];
            let _module = '';
            let _style = '';
            relations.map((item: any) => {
              keys.push(hashString(item));
              if (global['es-style'].style[item]) {
                _module = item;
                _style = global['es-style'].style[item];
              }
            });
            if (mainChunkModules.indexOf(_module) !== -1 && _style) {
              _CommonFileHashName[(mainChunkModules as any).indexOf(_module)] = _style;
            } else {
              keys = Array.from(new Set(quickSort(keys)));
              if (!_CommonFileHashName[keys[0]] && _style) {
                _CommonFileHashName[keys[0]] = _style;
              }
            }
          });
        }

        /**
         * 收集公共样式
         */
        // 提取全局的样式
        CommonStyle = '';
        const _CommonFileHashNameKeys = Array.from(
          new Set(quickSort(Object.keys(_CommonFileHashName)))
        );
        _CommonFileHashNameKeys.map((item: any) => {
          CommonStyle += _CommonFileHashName[item];
        });

        // 复用两个不同chunk的css-module需要提取
        const CommonFileHashNameKeys = Array.from(
          new Set(quickSort(Object.keys(CommonFileHashName)))
        );
        CommonFileHashNameKeys.map((item: any) => {
          CommonStyle += CommonFileHashName[item];
        });

        // 分析MyChunks，寻找MyChunks里面的css资源内容>=2 一致，将销毁该chunk，同时提取出资源，按从小到大排序，提取到CommonStyle中
        const commonChunk: any = [];
        const unqiueChunkStyle: any = {};
        const commonChunkStyle: any = {};

        for (const debugId in MyChunks) {
          const item = MyChunks[debugId];
          const styleId = hashString(item.style);
          if (unqiueChunkStyle[styleId]) {
            commonChunk.push(unqiueChunkStyle[styleId], debugId);
            commonChunkStyle[styleId] = item.style;
          } else {
            unqiueChunkStyle[styleId] = debugId;
          }
        }

        if (commonChunk.length) {
          // 重新排序拼接公共style
          const commonChunkStyleKeys = Array.from(
            new Set(quickSort(Object.keys(commonChunkStyle)))
          );
          commonChunkStyleKeys.map((item: any) => {
            CommonStyle += commonChunkStyle[item];
          });

          // 销毁chunk对于style资源的处理
          commonChunk.map((item: any) => {
            MyChunks[item].style = '';
          });
        }
      });

      // 插入请求样式资源模板
      const { mainTemplate } = compilation;

      // 写入css资源id到webpack入口文件中
      mainTemplate.hooks.localVars.tap(pluginName, (source: any, chunk: any) => {
        if (Object.keys(MyChunks).length > 0) {
          return Template.asString([
            source,
            '',
            '// object to store loaded CSS chunks',
            'var installedEsStyleCssChunks = {',
            Template.indent(chunk.ids.map((id: any) => `${JSON.stringify(id)}: 0`).join(',\n')),
            '}'
          ]);
        }

        return source;
      });

      // 写入webpack入口代码，实现在前端单页切换加载对应的css资源文件
      mainTemplate.hooks.requireEnsure.tap(pluginName, (source: any) => {
        const chunkMap: any = {};
        for (const debugId in MyChunks) {
          const item = MyChunks[debugId];
          if (SplitStyleModules.indexOf(item.entry) === -1) {
            if (item.style && item.name === null) {
              chunkMap[item.id] = 1;
            }
          }
        }
        if (Object.keys(chunkMap).length > 0) {
          return Template.asString([
            source,
            '',
            `// ${pluginName} CSS loading`,
            `var cssChunks = ${JSON.stringify(chunkMap)};`,
            `var jsonpString = jsonpScriptSrc.toString().replace('scripts','styles').replace(/return\\s(.*\\.p)/,'return _p');`,
            `var fn = new Function('_p','return ' + jsonpString);`,
            'if(installedEsStyleCssChunks[chunkId]) promises.push(installedEsStyleCssChunks[chunkId]);',
            'else if(installedEsStyleCssChunks[chunkId] !== 0 && cssChunks[chunkId]) {',
            Template.indent([
              'promises.push(installedEsStyleCssChunks[chunkId] = new Promise(function(resolve, reject) {',
              Template.indent([
                `var fullhref = fn(${mainTemplate.requireFn}.p)(chunkId).replace(/\\.js$/,'.css');`,
                `// 判断fullhref是否已经通过link加载`,
                'var existingLinkTags = document.getElementsByTagName("link");',
                'for(var i = 0; i < existingLinkTags.length; i++) {',
                Template.indent([
                  'var tag = existingLinkTags[i];',
                  'if(tag.rel === "stylesheet" && tag.getAttribute("href") === fullhref) {',
                  Template.indent(['return resolve();']),
                  '}'
                ]),
                '}',
                'var linkTag = document.createElement("link");',
                'linkTag.rel = "stylesheet";',
                'linkTag.type = "text/css";',
                'linkTag.onload = resolve;',
                'linkTag.onerror = function(event) {',
                Template.indent([
                  'var request = event && event.target && event.target.src || fullhref;',
                  'var err = new Error("Loading CSS chunk " + chunkId + " failed.\\n(" + request + ")");',
                  'err.request = request;',
                  'reject(err);'
                ]),
                '};',
                'linkTag.href = fullhref;',
                'var head = document.getElementsByTagName("head")[0];',
                'head.appendChild(linkTag);'
              ]),
              '}).then(function() {',
              Template.indent(['installedEsStyleCssChunks[chunkId] = 0;']),
              '}));'
            ]),
            '}'
          ]);
        }
        return source;
      });

      // 整理hash后的文件依赖
      compilation.hooks.additionalChunkAssets.tap(pluginName, (chunks: any) => {
        chunks.map((item: any) => {
          if (MyChunks[item.debugId]) {
            const scriptsFiles = item.files.filter((file: any) => /scripts\//.test(file));
            if (scriptsFiles.length) {
              MyChunks[item.debugId].fileName = scriptsFiles[0]
                .split('/')
                .pop()
                .replace(/\.js$/, '.css');
            }
          }
        });
      });
    });

    // 输出样式资源和map映射文件
    compiler.hooks.emit.tapAsync(pluginName, (compilation: any, callback: any) => {
      let map: any = {};

      // 生成bundle文件
      const bundleLength = Object.keys(MyChunks).length;
      for (const debugId in MyChunks) {
        const item = MyChunks[debugId];
        const style = item.style;
        const fileName = item.fileName;

        if (item.name === 'main') {
          // 入口文件，默认是main，所以不能修改默认入口
          map[item.name] = item.fileName.replace(/\.css/, '');
        } else {
          if (style !== '' && bundleLength > 1) {
            if (item.name === null) {
              item['hash-bundle'].map((hash: any) => {
                map[hash] = fileName;
              });
              const _style = cleanStyle(style);
              compilation.assets['styles/' + fileName] = {
                source() {
                  return _style;
                },
                size() {
                  return _style.length;
                }
              };
            } else {
              CommonStyle += style;
            }
          }
        }
      }

      // 生成公共样式文件
      if (CommonStyle !== '') {
        const _style = cleanStyle(CommonStyle);
        const _file = md5(_style).substr(0, 5) + '.css';
        map[0] = _file;
        compilation.assets['styles/' + _file] = {
          source() {
            return _style;
          },
          size() {
            return _style.length;
          }
        };
      }

      // 生成提供服务器使用的css文件的map
      map = JSON.stringify(map);
      compilation.assets['map.json'] = {
        source() {
          return map;
        },
        size() {
          return map.length;
        }
      };
      let splitStyle: any = {
        split: {},
        hash: {}
      };
      for (let key in Splitdeps) {
        const item = Splitdeps[key];
        const _key = key !== this.entry ? hashString(key) : '0';
        splitStyle.split[_key] = item.map((file: any) => hashString(file));
        for (const debugId in MyChunks) {
          const entry = MyChunks[debugId].entry;
          if (entry === key) {
            splitStyle.hash[_key] = MyChunks[debugId].fileName.replace(/\.css/, '');
          }
        }
      }
      splitStyle = JSON.stringify(splitStyle);

      compilation.assets['split-style.json'] = {
        source() {
          return splitStyle;
        },
        size() {
          return splitStyle.length;
        }
      };
      callback();
    });
  }
}

export default Plugin;
