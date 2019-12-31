/**
 * 单个路由组件离开的处理的中间件
 */
import * as React from 'react';
import { realPath, pathname, loadParams, routeComponents } from 'award-utils';
import { ICtx, IKernal } from '../type';

export default function routeWillLeave(this: IKernal) {
  return async (ctx: ICtx, next: Function) => {
    /**
     * /a -> /b/c
     * diff后的路由 和当前路由都不一致，说明当前路由都要leave
     *
     * /a/b -> /a    b - leave match_route不一致，剔除diff部分进行leave
     * /a/1 -> /a/2  b - leave match_route一致，取diff部分进行leave
     * diff后的路由部分和当前路由一致，选择一致的路由进行leave
     */
    /**
     *
     * /a /a/:id => /b
     *
     * /a /a/:id => /a /a/:id  (/a/1 => /a/2)
     */
    const needLeave: any[] = [];
    const noLeave = this.leavePaths.pop() || '';
    if (ctx.targeDiffRoutes.length) {
      const lastMatchRoutes: any = {};
      const currentMatchRoutes: any = {};

      ctx.lastMatchRoutes.forEach((item: any) => {
        lastMatchRoutes[item.route.path] = item.match.url;
      });

      ctx.targetMatchRoutes.forEach((item: any) => {
        currentMatchRoutes[item.route.path] = item.match.url;
      });

      const _lastMatchRoutes = Object.keys(lastMatchRoutes);
      const _currentMatchRoutes = Object.keys(currentMatchRoutes);

      _lastMatchRoutes.forEach((item: any, index: any) => {
        if (item !== noLeave) {
          if (item !== _currentMatchRoutes[index]) {
            needLeave.push(item);
          } else {
            if (lastMatchRoutes[item] !== currentMatchRoutes[item]) {
              needLeave.push(item);
            }
          }
        }
      });

      if (needLeave.length === 0) {
        // 需要判断search，该search也只针对最末的路由组件
        if (ctx.lastRoute !== ctx.route) {
          needLeave.push(_lastMatchRoutes.pop());
        }
      }
    } else {
      ctx.targetMatchRoutes.forEach((item: any) => {
        needLeave.push(item.route.path);
      });
    }

    const routeWillLeave = (component: any, path: any) =>
      new Promise(resolve => {
        component.routeWillLeave(
          { ...ctx.target, query: ctx.query },
          { ...ctx.lastTarget, query: ctx.lastQuery },
          async (data: any) => {
            if (React.isValidElement(data)) {
              if (typeof data.type === 'string') {
                if (process.env.NODE_ENV === 'development') {
                  console.warn(`[${path}][routeWillLeave] next函数接收的不是react组件！！！`);
                }
                resolve(false);
              } else {
                if (await this.modal(ctx.target, ctx.lastTarget, data)) {
                  resolve(true);
                } else {
                  resolve(false);
                }
              }
            } else {
              switch (typeof data) {
                case 'undefined':
                  resolve(true);
                  break;

                case 'string':
                  this.leavePaths.push(path);
                  this.history.push(data);
                  resolve(false);
                  break;
                case 'boolean':
                  resolve(data);
                  break;
                case 'object':
                  // eslint-disable-next-line no-case-declarations
                  const { replace = false, ...rest } = data;
                  this.leavePaths.push(path);
                  if (replace) {
                    this.history.replace(rest);
                  } else {
                    this.history.push(rest);
                  }
                  resolve(false);
                  break;

                default:
                  console.warn('next函数接收的类型不正确');
                  resolve(false);
                  break;
              }
            }
          },
          this.getInitialState()
        );
      });

    let i = needLeave.length - 1;
    while (i >= 0) {
      const component = routeComponents.get(needLeave[i]);
      if (component && component.routeWillLeave && typeof component.routeWillLeave === 'function') {
        if (!(await routeWillLeave(component, needLeave[i]))) {
          // 没有继续跳转，如果是前进后退，需要将其正确归位
          const { basename } = loadParams.get();
          if (realPath(basename, pathname()) === ctx.route) {
            if (!this.routeIsSwitch) {
              // eslint-disable-next-line max-depth
              if (process.env.ROUTER === 'hash') {
                window.location.hash = ctx.lastRoute;
              } else {
                history.pushState(null, '', ctx.lastRoute);
              }
            } else {
              this.routeChanged = false;
              this.history.push(ctx.lastRoute);
            }
          }
          return ctx.cb(false);
        }
      }
      i--;
    }
    await next();
  };
}
