import { ICtx, IKernal } from '../type';

export default function renderRoute(this: IKernal) {
  return (ctx: ICtx) => {
    /**
     * 如果全局路由变量和当前中间件内的变量一致
     * 说明还是在当前实例化的对象内执行
     */
    if (this.lastRoute === ctx.route) {
      return ctx.cb(false);
    }

    // 找出当前需要更新的组件，即剔除创建组件的路由
    const existRoutes: any = [];
    const diffRoutes =
      ctx.targeDiffRoutes.length === 0 ? ctx.targetMatchRoutes : ctx.targeDiffRoutes;
    diffRoutes.forEach((item: any) => {
      if (typeof item === 'object') {
        if (this.emitter.exist(item.match.path)) {
          existRoutes.push(item);
        }
      }
    });

    // 触发react-router的组件渲染、渲染基础DOM
    ctx.cb(true);

    // 通知组件发生数据更新
    setTimeout(() => {
      existRoutes.forEach((item: any) => {
        this.emitter.emit(item.match.path, item.route.needInitiProps);
      });
    }, 0);
  };
}
