/**
 * 路由发生变化，根组件钩子函数处理中间件
 */
import { routerWillUpdate } from '../../utils/routerLifecycle';
import { ICtx, IKernal } from '../type';

export default function routerWillUpdateMiddleware(this: IKernal) {
  return async (ctx: ICtx, next: any) => {
    /**
     * 执行路由跳转前routerWillUpdate生命周期钩子的触发
     */
    if (
      !(await routerWillUpdate({
        to: ctx.target,
        from: ctx.lastTarget,
        history: this.history,
        data: this.getInitialState()
      }))
    ) {
      return ctx.cb(false);
    }
    // 存储参数
    this.setParam(ctx.targetLocation);

    await next();
  };
}
