import loadParams from 'award-utils/loadParams';
import Head from './head';
import Consumer from './consumer';
import start from './start';
import setAward from './setAward';
import removeAward from './removeAward';

export { default as Head } from './head';
export { default as Consumer } from './consumer';
export { default as start, ErrorProps } from './start';
export { default as setAward } from './setAward';
export { default as removeAward } from './removeAward';

if (process.env.RUN_ENV === 'web') {
  let webBasename = '';
  ('<$>__AWARD__BASENAME__<$>');
  if (window.awardBasename) {
    webBasename = window.awardBasename;
  }
  loadParams.set({ basename: webBasename });
}

export const basename = () => {
  return loadParams.get().basename;
};

const _default: any = {
  Head,
  start,
  Consumer,
  setAward,
  removeAward,
  basename
};

// 需要区分服务端和客户端读取插件默认导出的资源
let _award_plugins_ = null;
if (process.env.RUN_ENV === 'node') {
  // 服务端
  _award_plugins_ = global.__AWARD__PLUGINS__;
} else {
  /**
   * 客户端，babel识别到<$>__AWARD__PLUGINS__<$>，那么将对其注入下面插件代码
   * {
   *   "award-plugin-dva":{
   *     name: 'dva',
   *     default: require('award-plugin-dva'),
   *     client: require('award-plugin-dva/lib')
   *   }
   * }
   */
  ('<$>__AWARD__PLUGINS__<$>');
}

// 分析插件结构，并导出资源
if (_award_plugins_) {
  Object.values(_award_plugins_).forEach((plugin: any) => {
    const api = plugin.default;
    const name = plugin.name;
    if (api) {
      _default[name] = api.default || api;
      exports[name] = api.default || api;
    }
  });
}

export default _default;
