/**
 * 判断路由是否变化的中间件
 */
import { ICtx, IKernal } from '../type';

export default function routeChanged(this: IKernal) {
  return async (ctx: ICtx, next: Function) => {
    /**
     * 如果切换的目标路由和当前路由是一致
     * 那么将不做任何逻辑
     */
    if (this.lastRoute === ctx.route) {
      return ctx.cb(false);
    }
    await next();
  };
}
