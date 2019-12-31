import * as _ from 'lodash';
import { IContext } from 'award-types';
import pageCache from './load';
import { Middleware } from 'koa';
import nodePlugin from 'award-plugin/node';

/**
 * node缓存无数据html
 * @param {options} lruache参数
 */

let init = false;

/** 判断是否缓存，命中缓存 cache */
export default (): Middleware<any, IContext> => {
  return async function CacheMiddleware(ctx, next) {
    await nodePlugin.hooks.willCache({ context: ctx });
    const { cache } = ctx.award;
    if (cache) {
      if (!init) {
        init = true;
        if (typeof cache === 'object' && _.isObject(cache)) {
          pageCache.init(cache);
        }
      }

      const logTime = Number(new Date());

      const html = pageCache.get(ctx);

      if (html && !ctx.award.dev) {
        ctx.cacheTime = Number(new Date()) - logTime;

        ctx.award.html = html;
      } else {
        await next();
        pageCache.set(ctx, ctx.award.html);
      }
    } else {
      await next();
    }
  };
};
