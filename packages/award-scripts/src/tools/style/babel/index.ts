import Program from './Program';
import JSXOpeningElement from './JSXOpeningElement';

// 存储样式
if (!global['es-style']) {
  global['es-style'] = {
    es: {}, // 存放css module
    style: {}, // 存放公共css资源
    relation: {
      // 存放关系依赖
      es: {
        hash: {}, // hash => 多文件 {100:['a.js','b.js']}
        file: {} // 文件 => hash值  {'a.js': 100,'b.js':100}
      },
      style: {
        hash: {},
        file: {}
      }
    }
  };
}

const cache: any = {};
global.ImportSource = [];
global.staticSource = {};

/**
 * 启动时：
 * a.css mtime 10:10
 * b.css mtime 10:11
 *
 * 热更新时：
 * a.css mtime 10:10 不做任何的award-style的babel事情，即state.disable = true
 *
 * a.css cache存储 mtime, state.css, state.styleId 主要用于js的bable解析存放css和styleId
 *
 * ```json
 * {
 *  "[ a.js.path ]":"{ css, styleId, dep:{
 *      a.0.css.path: mtime,
 *      a.1.css.path: mtime
 *    }
 *   }",
 * "[ b.js.path ]":"{ css, styleId, dep:{
 *      b.0.css.path: mtime,
 *      b.1.css.path: mtime
 *    }
 *   }"
 * }
 * ```
 *
 * b.css mtime 10:20 state.disable = false
 */
export default () => ({
  visitor: {
    Program: Program(cache),
    JSXOpeningElement
  }
});
