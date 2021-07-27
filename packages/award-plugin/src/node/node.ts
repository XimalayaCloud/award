/* eslint-disable max-depth */
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
  let content = null;
  let result = true;
  if (nameL) {
    let i = 0;
    while (i < nameL) {
      const { fn, name } = storeApis[hookName][i];
      try {
        if (fn) {
          content = await fn.call(
            {
              content
            },
            params
          );
          if (typeof content === 'boolean' && !content) {
            // 一旦其中某个插件执行结果是false，那么针对布尔类型的返回值都将是false
            result = false;
          }
        }
        i++;
      } catch (error) {
        throw new Error(
          `\n[ plugin-name:      ${name} ]\n[ plugin-hookName:  ${hookName} ]\n${error}`
        );
      }
    }
  }
  if (!result) {
    return false;
  }
  return content;
};

const syncStart = (hookName: string, params: any) => {
  const nameL = storeApis[hookName].length;
  let content = null;
  let result = true;
  if (nameL) {
    let i = 0;
    while (i < nameL) {
      const { fn, name } = storeApis[hookName][i];
      try {
        if (fn) {
          content = fn.call(
            {
              content
            },
            params
          );
          if (typeof content === 'boolean' && !content) {
            // 一旦其中某个插件执行结果是false，那么针对布尔类型的返回值都将是false
            result = false;
          }
        }

        i++;
      } catch (error) {
        throw new Error(
          `\n[ plugin-name:      ${name} ]\n[ plugin-hookName:  ${hookName} ]\n${error}`
        );
      }
    }
  }
  if (!result) {
    return false;
  }
  return content;
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
        const Run = node.default || node;
        currentName = name;
        try {
          if (Run.prototype?.apply) {
            new Run(defaultApis, options, name).apply();
          } else {
            if (typeof Run === 'function') {
              Run(defaultApis, options);
            }
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
  names.forEach((name) => {
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
        return syncStart(fnName, params);
      };
    }
    if (fnType === 'async') {
      // 异步任务
      hooks[fnName] = async (params?: any) => {
        return await asyncStart(fnName, params);
      };
    }
  });
  return hooks;
};

export const unregister = (names: Array<any>) => {
  names.forEach((name) => {
    const { name: fnName } = parseAsync(name);
    storeApis[fnName] = [];
  });
};
