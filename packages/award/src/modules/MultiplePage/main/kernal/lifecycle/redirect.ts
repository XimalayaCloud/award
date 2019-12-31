/**
 * 处理重定向逻辑
 */

import { RedirectFunction } from 'award-utils';
import { ICtx, IKernal } from '../type';

export default function redirect(this: IKernal) {
  return async (ctx: ICtx, next: Function) => {
    const redirect = await RedirectFunction(
      ctx.targetMatchRoutes,
      ctx.targetMatchRoutesLength,
      ctx.targetLocation.pathname
    );
    if (redirect) {
      this.history.push(redirect);
      return ctx.cb(false);
    }
    await next();
  };
}
