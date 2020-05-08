import { IContext } from 'award-types';
import * as LruCache from 'lru-cache';

export let pageCache = new LruCache();

const cacheUtil = {
  init(config?: LruCache.Options<string, string>) {
    pageCache = new LruCache(config);
  },
  _getPath(ctx: IContext) {
    try {
      const { match_routes } = ctx.award;

      const l = match_routes.length;

      if (l) {
        if (typeof match_routes[l - 1] !== 'object') {
          // 什么时候会不是object????
          return match_routes[l - 2].route.path;
        } else {
          return match_routes[l - 1].route.path;
        }
      } else {
        return '_award'; // 没有设置路由，默认设置_award进行存储缓存
      }
    } catch (e) {
      // eslint-disable-next-line no-throw-literal
      throw '[pageCache-error]: no routes' + e;
    }
  },
  get(ctx: IContext) {
    let html: any = '';
    const path = this._getPath(ctx);

    if (path) {
      html = pageCache.get(path);
    }
    // 路径匹配缓存在
    if (html) {
      // 直接读缓存，不做任何计算处理
      if (process.env.NODE_ENV !== 'production') {
        console.info(`[hit]${path}`);
      }
      ctx.set('X-Award-Cache', 'true');
    }
    return html;
  },
  set(ctx: IContext, html: string) {
    const path = this._getPath(ctx);
    if (process.env.NODE_ENV !== 'production') {
      console.info(`[cache]: ${path}`);
    }
    if (path) {
      pageCache.set(path, html);
    }
  }
};

export default cacheUtil;
