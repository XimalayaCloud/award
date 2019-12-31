/**
 * 处理路由所有生命周期
 * routeWillLeave
 * routerWillUpdate
 * routerDidUpdate
 */
import Common from './common';

import LifeCycleMiddleware from './lifecycle/index';
import init from './lifecycle/init';
import routeChanged from './lifecycle/routeChanged';
import routeWillLeave from './lifecycle/routeWillLeave';
import redirect from './lifecycle/redirect';
import routerWillUpdate from './lifecycle/routerWillUpdate';
import bundleAndData from './lifecycle/bundleAndData';
import renderRoute from './lifecycle/renderRoute';

export default class RouterLifeCycle extends Common {
  /**
   * 通过独立的LifyCycle中间件类来处理每一次路由跳转
   * 通过中间件实现了变量参数隔离，防止快速切换导致全局的变量被更新掉了
   */
  public async getUserConfirmation(promptMessage: string, cb: (x: boolean) => any) {
    /** 实例化中间件模型 */
    let app = new LifeCycleMiddleware();

    /** 初始化数据 */
    app.use(init.call(this, promptMessage, cb));

    /** 确认当前路由是否发生变化 */
    app.use(routeChanged.call(this));

    /** 路由组件离开触发逻辑处理 */
    app.use(routeWillLeave.call(this));

    /** 跳转目标路由地址重定向分析 */
    app.use(redirect.call(this));

    /** 路由将要开始跳转了，触发全局钩子处理 */
    app.use(routerWillUpdate.call(this));

    /** 路由跳转中，加载bundle.js和目标路由的数据等 */
    app.use(bundleAndData.call(this));

    /** 路由处理完毕，开始渲染路由了 */
    app.use(renderRoute.call(this));

    /** 开始执行逻辑 */
    app.listen();

    /** 清除缓存 */
    (app as any) = null;
  }
}
