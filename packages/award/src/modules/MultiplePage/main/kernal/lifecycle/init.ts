import { matchRoutes } from 'react-router-config';
import { loadParams, realPath } from 'award-utils';

import findDiff from '../../utils/routesDiff';
import qs from '../../utils/qs';
import { ICtx, IKernal } from '../type';

export default function init(this: IKernal, promptMessage: string, cb: Function) {
  // 路由切换，获取匹配数组
  return async (ctx: ICtx, next: Function) => {
    let pass = true;
    let rundiffCb: any = null;
    const diffCallback = (diffCb: Function) => {
      rundiffCb = diffCb;
    };
    /** 读取当前全局数据到ctx对象 */
    ctx.cb = (isPass: boolean) => {
      pass = isPass;
      if (process.env.WEB_TYPE === 'WEB_SPA') {
        if (this.exportPath) {
          const targetPath = ctx.targetMatchRoutes[ctx.targetMatchRoutesLength - 1].match.path;
          for (let html in this.exportPath) {
            if (Object.prototype.hasOwnProperty.call(this.exportPath, html)) {
              if (targetPath === this.exportPath[html]) {
                location.href = html + '#' + ctx.route;
                break;
              }
            }
          }
        } else {
          cb(isPass);
        }
      } else {
        cb(isPass);
      }
      if (pass && !loadParams.get().isRenderRouter) {
        // 需要切换，但是路由组件未生成，即Switch未渲染，这个时候主动触发渲染
        loadParams.set({ isRenderRouter: true });
        this.forceRenderRouter();
      }
    };
    ctx.routes = this.routes;
    ctx.lastMatchRoutes = this.lastMatchRoutes;
    ctx.lastRoute = this.lastRoute;

    /** 记录当前路由跳转数据 */
    const { basename } = loadParams.get();
    ctx.targetLocation = (JSON.parse(promptMessage) as {
      location: {
        pathname: string;
        search: string;
      };
    }).location;

    ctx.targetLocation.pathname = realPath(basename, ctx.targetLocation.pathname);

    const splitPathname = ctx.targetLocation.pathname.split('?');
    if (splitPathname[1]) {
      ctx.targetLocation.pathname = splitPathname[0];
      const query = splitPathname[1];
      ctx.targetLocation.search += (ctx.targetLocation.search === '' ? '?' : '&') + query;
    }

    ctx.query = qs(ctx.targetLocation.search);

    /**
     * 记录pathname，可以会变，如果识别是路由别名，会重新修正为我们定义的真实路由path
     */
    ctx.pathname = ctx.targetLocation.pathname;

    /**
     * 存储当前实际路由，即用户在浏览器上看到的具体路由
     */

    ctx.route = ctx.pathname + ctx.targetLocation.search;

    /** 根据实际定义的path找到匹配的路由map表 */
    ctx.targetMatchRoutes = matchRoutes(ctx.routes, ctx.pathname);

    ctx.target = {
      match_routes: ctx.targetMatchRoutes,
      location: ctx.targetLocation
    };
    ctx.lastTarget = this.target;
    ctx.lastQuery = this.lastQuery;

    ctx.targetMatchRoutesLength = ctx.targetMatchRoutes.length;
    ctx.targeDiffRoutes = findDiff(ctx.targetMatchRoutes, ctx.targetLocation.search, diffCallback);

    try {
      await next();
      if (pass) {
        if (rundiffCb && typeof rundiffCb === 'function') {
          rundiffCb();
        }
        /** 存储全局变量值到公共环境的this中去 */
        this.target = ctx.target;
        this.lastQuery = ctx.query;
        this.lastTarget = ctx.lastTarget;
        this.lastMatchRoutes = ctx.targetMatchRoutes;
        this.lastRoute = ctx.route;
        this.routeIsSwitch = true;
        this.routeChanged = true;
      }
    } catch (error) {
      console.error(error);
    }
  };
}
