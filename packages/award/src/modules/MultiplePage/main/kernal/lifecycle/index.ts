/**
 * 利用中间件模型，处理每次路由切换的业务逻辑
 */
export default class LifeCycleMiddleware {
  private stack: Array<Function> = [];
  public use(fun: Function) {
    this.stack.push(fun);
  }

  private async start(ctx = {}) {
    if (this.stack.length) {
      const func = this.stack.shift();
      if (typeof func === 'function') {
        await func(ctx, this.start.bind(this, ctx));
      }
    }
  }

  public listen() {
    this.start();
  }
}
