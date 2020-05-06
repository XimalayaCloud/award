/**
 * 初始化中间件
 */
import fetch from 'award-fetch';
import { IContext, IServer, IConfig } from 'award-types';
import { Middleware } from 'koa';
import { serverInfo } from 'award-utils/server';
import nodePlugin from 'award-plugin/node';
import loadEntryFile from '../utils/loadEntryFile';
import { clearConsole } from '../../tool';
import removeModule = require('../../remove');

export default function hmrEntrySource(this: IServer): Middleware<any, IContext> {
  const self = this;
  return async function hmrEntrySourceMiddleware(ctx, next) {
    /**
     * 重新加载入口文件，即重新require组件
     */
    clearConsole();
    console.info(`=============================[REFRESH]=============================`);
    const config = self.config.toObject() as IConfig;
    // 重新注册plugin
    nodePlugin.unregister();
    if (config && config.plugins) {
      config.plugins.forEach((item: any) => {
        let name = null;
        if (Array.isArray(item)) {
          name = item[0];
        } else {
          name = item;
        }
        if (/^(.*)award-plugin-(.*)/.test(name)) {
          try {
            removeModule(name + '/node');
          } catch (error) {}
        }
      });
      nodePlugin.register(config.plugins);
    }
    try {
      // 重新加载入口文件
      global.ServerHmr = true;
      fetch.clean();
      await loadEntryFile.call(self);
      await next();
      global.ServerHmr = false;
    } finally {
      if (self.RootPageEntry) {
        removeModule(self.RootPageEntry);
        serverInfo.call(self);
      }
    }
  };
}
