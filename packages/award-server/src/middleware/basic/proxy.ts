/**
 * 代理中间件
 */

import * as httpProxy from 'http-proxy-middleware';
import * as regxp from 'path-to-regexp';
import { IContext, IConfig, IServer } from 'award-types';
import k2c = require('koa2-connect');
import { Middleware } from 'koa';
import CommonMiddleware from '../common';

export default function (this: IServer): Middleware<any, IContext> {
  /** 远程服务数据 */
  if (this.isProxy) {
    const self = this;
    return async function ProxyMiddleware(ctx: any, next: any) {
      const { path } = ctx;
      let proxy = false;
      /**
       * dev环境动态获取targets
       */
      const config = self.config.toObject() as IConfig;
      const { customs, ...rests } = config.proxyTable;
      if (customs && Array.isArray(customs)) {
        let i = 0;
        while (i < customs.length) {
          const custom = customs[i];
          if (typeof custom.filter === 'function' && typeof custom.options === 'object') {
            proxy = true;
            const write = ctx.res.write;
            const end = ctx.res.end;
            let isEnd = false;
            ctx.res.end = function (...args: any[]) {
              isEnd = true;
              end.apply(ctx.res, args);
            };
            ctx.res.write = function (...args: any[]) {
              if (!isEnd) {
                write.apply(ctx.res, args);
              }
            };
            await k2c(httpProxy(custom.filter, custom.options))(ctx, next);
          }
          i++;
        }
      }
      for (const route in rests) {
        if (regxp.pathToRegexp(route).test(path) || new RegExp(`^${route}`).test(path)) {
          proxy = true;
          const write = ctx.res.write;
          const end = ctx.res.end;
          let isEnd = false;
          ctx.res.end = function (...args: any[]) {
            isEnd = true;
            end.apply(ctx.res, args);
          };
          ctx.res.write = function (...args: any[]) {
            if (!isEnd) {
              write.apply(ctx.res, args);
            }
          };
          await k2c(httpProxy(path, rests[route]))(ctx, next);
          break;
        }
      }
      if (proxy === false) {
        await next();
      }
    };
  }
  return CommonMiddleware;
}
