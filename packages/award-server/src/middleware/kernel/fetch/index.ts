/**
 * 实现服务端处理接口请求的中间件
 */
import loadData from './load';
import { IContext } from 'award-types';
import { Middleware } from 'koa';

/** 根据匹配到的地址解析对应接口数据 fetch */
export default (): Middleware<any, IContext> => {
  return async function FetchMiddleware(ctx, next) {
    const { mode, router, fetch: fetchConfig } = ctx.award.config;
    /**
     * 执行数据获取
     * 1. 服务端运行
     * 2. browser
     * 3. 不是缓存页面
     *
     * 如果当前请求地址在前面没有被捕获，且匹配路由为空，这时需注意请求循环
     * 如果请地址的url前缀在配置的fetch内的domainMap中，不予通过
     */

    if (!ctx.award.match_routes.length) {
      const { domainMap } = fetchConfig;

      for (const key in domainMap) {
        if (new RegExp('^/' + key).test(ctx.award.url)) {
          throw new Error(
            '接口:' + ctx.award.url + '没有被mock或者proxy捕获到，请确认是否开启数据代理'
          );
        }
      }
    }

    // 服务端渲染，且浏览器形式的地址
    if (mode === 'server' && router === 'browser') {
      await loadData(ctx);
    }

    await next();
  };
};
