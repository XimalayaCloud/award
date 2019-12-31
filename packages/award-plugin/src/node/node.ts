/**
 * node端插件处理，包括插件注册、插件钩子存储、插件执行
 */
import { parseAsync } from '../utils';

const storeApis: any = {};
const defaultApis: any = {};
const hooks: any = {};
let currentName: any = null;

const asyncStart = async (hookName: string, params: any) => {
  const nameL = storeApis[hookName].length;
  if (nameL) {
    let i = 0;
    let content = null;
    while (i < nameL) {
      const { fn, name } = storeApis[hookName][i];
      try {
        content = await fn.call(
          {
            content
          },
          params
        );
        i++;
      } catch (error) {
        throw new Error(
          `\n[ plugin-name:      ${name} ]\n[ plugin-hookName:  ${hookName} ]\n${error}`
        );
      }
    }
  }
};

const syncStart = (hookName: string, params: any) => {
  const nameL = storeApis[hookName].length;
  if (nameL) {
    let i = 0;
    let content = null;
    while (i < nameL) {
      const { fn, name } = storeApis[hookName][i];
      try {
        content = fn.call(
          {
            content
          },
          params
        );
        i++;
      } catch (error) {
        throw new Error(
          `\n[ plugin-name:      ${name} ]\n[ plugin-hookName:  ${hookName} ]\n${error}`
        );
      }
    }
  }
};

export const register = (plugins: Array<any>) => {
  plugins.forEach((item: any) => {
    let name = null;
    let options: any = {};
    if (Array.isArray(item)) {
      name = item[0];
      options = item[1] || {};
    } else {
      name = item;
    }
    if (/^(.*)award-plugin-(.*)/.test(name)) {
      try {
        // node环境可以直接require引用依赖
        const node = require(`${name}/node`);
        const run = node.default || node;
        currentName = name;
        try {
          if (run.prototype && run.prototype.apply) {
            new run(defaultApis, options, name).apply();
          } else {
            run(defaultApis, options);
          }
        } catch (error) {
          // 插件注册出错
          console.error(`[ plugin-name: ${name} ] Node端注册插件时发生错误\n${error}`);
        }
      } catch (error) {}
    }
  });
};

/**
 * 首次注册钩子序列
 * 提供钩子列表用来挂载每个插件的hook
 */
export default (names: Array<any>) => {
  names.forEach(name => {
    const { name: fnName, type: fnType } = parseAsync(name);
    storeApis[fnName] = [];
    defaultApis[fnName] = (cb: Function) => {
      storeApis[fnName].push({
        fn: cb,
        name: currentName
      });
    };
    if (fnType === 'sync') {
      // 同步任务
      hooks[fnName] = (params?: any) => {
        syncStart(fnName, params);
      };
    }
    if (fnType === 'async') {
      // 异步任务
      hooks[fnName] = async (params?: any) => {
        await asyncStart(fnName, params);
      };
    }
  });
  return hooks;
};

export const unregister = (names: Array<any>) => {
  names.forEach(name => {
    const { name: fnName } = parseAsync(name);
    storeApis[fnName] = [];
  });
};
