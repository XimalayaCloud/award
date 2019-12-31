import * as findUp from 'find-up';
import * as fs from 'fs-extra';
import { join } from 'path';
import { IConfig, IAwardConfig } from 'award-types';

const cache = new Map();

const defaultConfig = {
  entry: './index', // 入口
  basename: '', // 路由前缀
  mode: 'server', // 默认为服务端渲染
  router: 'browser', // 配置路由类型，只针对export导出时生效，其他时候都是默认的browser类型  ['hash','browser']
  hashName: true, // 当前入口静态资源是否使用hashName
  assetPrefixs: '/static/', // 静态资源地址
  crossOrigin: true, // 设置crossOrigin
  app: () => {
    // middlewares.push(<your middleware>);
    /**
     * 例子:
     * const cache = async(ctx, next)=>{
     *   //经过一系列的cache计算后，决定执行cache，那么进行如下设置
     *   ctx.award.cache = true
     * }
     * 那么，我们需要把中间件插入到哪里呢，首先需要知道middlewares是包含了哪些中间件
     * middlewares是一个系统内置的中间件数组，数组结构如下
     * middlewares = [
     *  '缓存处理中间件，判断ctx.award.cache值来决定是否获取缓存的html',
     *  '接口处理中间件，根据匹配到的地址解析其对应接口数据的中间件，并将获取到的数据存放到ctx.award.initialState中',
     *  '渲染页面中间件，根据接口数据、匹配组件渲染出html的中间件，html存放在ctx.award.html中'
     * ]
     * 所以我们知道这个cache中间件需要插入缓存中间件之前，如下实现即可
     * middlewares.splice(0, 0, cache); //将cache插入到数组第一位之后
     *
     * 说明:
     * 1.你可以在中间件的ctx中获取到ctx.award的值，并进行计算，其包含了当前请求产生的配置信息
     * 2.开发阶段，可以直接修改中间件代码，刷新页面查看中间件实现效果
     * 3.发布阶段，将不支持中间件热修复
     * 4.更多的使用demo请参考examples/with-middleware-开头的项目
     */
  },
  exportPath: null, // 设置需要导出path对应的html，对应多个path的html结构，但是是一个index.html，设置为null不导出html内容体
  proxyTable: {},
  fetch: {
    // fetch.config.js移到这里了
    domainMap: {
      // domain映射
      // "api":"localhost"
      // api: 'http://localhost:1234'
    },
    apiGateway: {}
  }
};

const loadConfig = (dir: string): IConfig => {
  const prod = process.env.AWARD_COMPILER
    ? false
    : process.env.NODE_ENV
    ? ['production', 'test'].includes(process.env.NODE_ENV)
    : false;
  const configPath = findUp.sync('award.config.js', {
    cwd: prod ? join(dir, '.award') : dir
  });

  let userConfig: any = {};

  // 获取award配置
  if (configPath) {
    const userConfigModule = require(configPath);
    userConfig = userConfigModule.default || userConfigModule;
    userConfig.configOrigin = configPath;
    // 筛选出支持默认导出API的插件，即该插件提供API给项目使用
    // 需要在award包中对API进行注册
    if (userConfig.plugins) {
      userConfig.plugins.forEach((plugin: any) => {
        try {
          let name = plugin;
          if (Array.isArray(plugin)) {
            name = plugin[0];
          }
          // 插件名称中间包含award-plugin
          if (/^(.*)award-plugin-(.*)/.test(name)) {
            const pluginDefault = require(name);
            const defaultName = name
              .replace(/^(.*)award-plugin-/, '')
              .split('-')
              .map((item: any, index: number) => {
                if (index > 0) {
                  return item.charAt(0).toUpperCase() + item.substr(1);
                }
                return item;
              })
              .join('');
            global.__AWARD__PLUGINS__[name] = {
              name: defaultName,
              default: pluginDefault
            };
          }
        } catch (error) {}
      });
    }
  }

  const config = { ...defaultConfig, ...userConfig };

  if (!/^http(s)?:|^\/\//.test(config.assetPrefixs)) {
    config.assetPrefixs = config.basename + config.assetPrefixs;
  }

  return config;
};

const entry = (dir: string, config: IAwardConfig) => {
  // 梳理入口
  if (!/\.(j|t)sx?$/.test(config.entry)) {
    const entryjs = join(dir, config.entry + '.js');
    const entryjsx = join(dir, config.entry + '.jsx');
    const entryts = join(dir, config.entry + '.ts');
    const entrytsx = join(dir, config.entry + '.tsx');

    if (fs.existsSync(entryjs)) {
      config.entry = config.entry + '.js';
    } else if (fs.existsSync(entryjsx)) {
      config.entry = config.entry + '.jsx';
    } else if (fs.existsSync(entryts)) {
      config.entry = config.entry + '.ts';
    } else if (fs.existsSync(entrytsx)) {
      config.entry = config.entry + '.tsx';
    } else {
      const entryIndexjs = join(dir, config.entry, 'index.js');
      const entryIndexjsx = join(dir, config.entry, 'index.jsx');
      const entryIndexts = join(dir, config.entry, 'index.ts');
      const entryIndextsx = join(dir, config.entry, 'index.tsx');
      if (!/\/$/.test(config.entry)) {
        config.entry = config.entry + '/';
      }
      if (fs.existsSync(entryIndexjs)) {
        config.entry = config.entry + 'index.js';
      } else if (fs.existsSync(entryIndexjsx)) {
        config.entry = config.entry + 'index.jsx';
      } else if (fs.existsSync(entryIndexts)) {
        config.entry = config.entry + 'index.ts';
      } else if (fs.existsSync(entryIndextsx)) {
        config.entry = config.entry + 'index.tsx';
      }
    }
  }
  return config;
};

export function getAwardConfig(dir = process.cwd(), refresh = false): IConfig {
  if (!global.__AWARD__PLUGINS__) {
    global.__AWARD__PLUGINS__ = {};
  }

  // 强制刷新获取最新的配置信息，一般是开发环境使用
  if (refresh || (!refresh && !cache.has(dir))) {
    cache.set(dir, entry(dir, loadConfig(dir)));
  }
  const config = cache.get(dir);

  /**  award build 服务端的代码输出目录 */
  config.server_dist = '.award';

  /**  award build 客户端的代码输出目录 */
  config.client_dist = 'dist';

  /**  award export 导出的代码输出目录 */
  config.export_dist = 'dist';

  return config;
}
