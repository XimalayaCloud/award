/**
 * 核心中间件
 */
import { IContext, Routes, IConfig, IServer } from 'award-types';
import { matchRoutes } from 'react-router-config';
import nodePlugin from 'award-plugin/node';
import { RedirectFunction, routeComponents } from 'award-utils';
import { Middleware } from 'koa';
import CommonMiddleware from '../common';

export default function(this: IServer): Middleware<any, IContext> {
  if (this.apiServer) {
    return CommonMiddleware;
  }
  /**
   * 1. 先根据请求地址匹配出路由列表
   * 2. 重新给ctx赋值award配置信息
   * 3. 判断404
   */
  const self = this;
  return async function CoreInitMiddleware(ctx: IContext, next: any) {
    // 请求的user-agent不能是node-fetch，防止循环引用
    if (/^node-fetch/.test(ctx.request.headers['user-agent'])) {
      throw new Error(`node-fetch requests are not accepted in award core`);
    }
    const url = ctx.request.url;
    const _url = url.split('?');
    const map = self.map.toJS();

    if (!self.dev && !map.main) {
      throw { status: 403, message: 'Award服务找不到静态资源映射表' };
    }

    /** 从不变的数据源里面获取新的routes、配置config */
    const routes = self.routes.toJS() as Routes;
    const config = self.config.toJS() as IConfig;
    const hasRoutes = routes.length ? true : false;

    if (config.assetPrefixs !== '/' && new RegExp(`^${config.assetPrefixs}`).test(url)) {
      return (ctx.status = 404);
    }

    if (self.dev) {
      /** 打印请求agent和host */
      console.info();
      console.info(`[user-agent]${url}: ${ctx.request.headers['user-agent']}`);
      console.info(`[host]${url}: ${ctx.request.headers.host}`);
    }

    /** 根据当前请求地址计算出匹配的路由信息 */
    let match_routes = routes.length ? matchRoutes(routes, ctx.request.url.split('?')[0]) : [];
    const matchLength = match_routes.length;

    /**
     * 保存当前匹配的路由和组件，以供路由渲染时提取
     */
    for (let i = 0; i < matchLength; i++) {
      const route = match_routes[i].route;
      routeComponents.set(route.path, route.component);
    }

    /** 重定向 */
    const redirectUrl = await RedirectFunction(match_routes, matchLength, _url[0]);
    if (redirectUrl) {
      return ctx.redirect(config.basename + redirectUrl);
    }

    let match = true;
    /** 如果最后匹配到的路由path没有定义 */
    if (hasRoutes) {
      if (matchLength) {
        // <Route />
        const info = match_routes[matchLength - 1];
        if (Object.keys(info.route).length === 0) {
          if (url !== '/') {
            match = false;
          } else {
            match_routes = [];
          }
        }
      } else {
        if (url !== '/') {
          match = false;
        }
      }
    }

    /** 给ctx赋予award相关的参数配置信息 */
    /** 需要保证上面的执行过程不能出错 */
    ctx.award = {
      url: _url[0],
      search: _url[1] || '',

      /** 初始化信息 */
      dev: self.dev,
      dir: self.dir,
      isMock: self.isMock,
      isProxy: self.isProxy,
      manifest: self.manifestFile,

      /** 组件 */
      RootComponent: self.RootComponent,
      RootDocumentComponent: self.RootDocumentComponent,

      /** award配置 */
      config,
      map,

      /** 路由 */
      match,
      routes,
      match_routes,

      /** award框架数据 */
      initialState: {
        award: {
          assetPrefixs: config.assetPrefixs
        }
      },

      /**  渲染后的html */
      html: '',

      /** 是否需要缓存 */
      cache: false,
      /** 标识是否发生错误 */
      error: false,
      /** 标识错误类型是否路由内错误还是路由外 */
      routerError: false,

      /** react-loadable */
      modules: []
    };

    await nodePlugin.hooks.modifyContextAward({
      context: ctx
    });

    if (match) {
      // eslint-disable-next-line no-useless-catch
      try {
        /** 执行主逻辑中间件 */
        await next();
      } catch (error) {
        ctx.award.error = true;
        /** 主逻辑发生错误，抛出主逻辑错误 */
        throw error;
      }
    } else {
      /** 抛出404错误 */
      ctx.award.error = true;
      ctx.award.routerError = true;
      // eslint-disable-next-line no-throw-literal
      throw { status: 404, routerError: true, __award__: true, NotFound: ctx.path };
    }

    if (!ctx.body) {
      /** render中间件会将渲染后的html赋值到 ctx.award.html上 */
      if (ctx.award.html) {
        ctx.body = ctx.award.html;
      } else {
        ctx.body = '<h1>NOT Found</h1>';
      }
    }
  };
}
