/**
 * 加载bundle和初始化数据
 */
import { Exception } from 'award-utils';
import clientPlugin from 'award-plugin/client';
import { IAwardException } from 'award-types';
import { ICtx, IKernal } from '../type';

export default function bundleAndData(this: IKernal) {
  return async (ctx: ICtx, next: Function) => {
    /**
     * 核心路由切换实现逻辑
     * 主要包括404逻辑、加载目标路由的bundle文件、请求数据
     */
    // 判断是否匹配404
    let match = true;
    if (ctx.targetMatchRoutesLength) {
      // <Route />
      const info = ctx.targetMatchRoutes[ctx.targetMatchRoutesLength - 1];
      if (Object.keys(info.route).length === 0) {
        if (ctx.targetLocation.pathname !== '/') {
          match = false;
        } else {
          ctx.targetMatchRoutes = [];
          ctx.targetMatchRoutesLength = 0;
        }
      }
    } else {
      if (ctx.targetLocation.pathname !== '/') {
        match = false;
      }
    }
    if (this.routes.length) {
      if (!match) {
        // 存在路由，没有匹配到，抛出404错误
        // 发送错误信号
        const errorInfo: IAwardException = await Exception.handleError.call(null, {
          status: 404
        });
        this.updateInitialState &&
          this.updateInitialState({
            match_routes: ctx.targetMatchRoutes,
            diffRoutes: ctx.targeDiffRoutes,
            error: errorInfo
          });
      } else {
        // 存在路由，匹配到了
        // 加载bundle，更新组件
        await this.loadBundles(ctx.targetMatchRoutes, ctx.targetLocation);

        await clientPlugin.hooks.routeChangeBeforeLoadInitialProps({
          emitter: this.emitter,
          match_routes: ctx.targetMatchRoutes
        });

        // 加载数据
        await this.loadInitialProps(
          ctx.targetMatchRoutes,
          ctx.targetLocation,
          ctx.targeDiffRoutes,
          ctx.pathname
        );
      }
    }
    await next();
  };
}
