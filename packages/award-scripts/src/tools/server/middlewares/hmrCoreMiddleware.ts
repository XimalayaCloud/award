import { IContext, IConfig, IServer } from 'award-types';
import { Middleware } from 'koa';
import { List } from 'immutable';
import * as _ from 'lodash';

const loadMiddleware = function(this: IServer, middlewares: List<Middleware<any, IContext>>) {
  const { app } = this.config.toObject() as IConfig;
  let _middlewares = middlewares.toArray();
  const result: any = app(_middlewares);
  if (result && _.isArray(result)) {
    _middlewares = result;
  }
  return _middlewares;
};

export default function hmrCoreMiddleware(
  this: IServer,
  middlewares: List<Middleware<any, IContext>>
) {
  const self = this;
  const newMiddlewares = loadMiddleware.call(this, middlewares);
  const startLength = this.app.middleware.length + this.middlewares.length + 1;
  let middlewareLength = newMiddlewares.length;

  // 动态挂载中间件
  async function coreHmrMiddleware(ctx: any, next: any) {
    let error = null;
    try {
      // 更新core中间件
      const _middlewares = loadMiddleware.call(self, middlewares);
      self.app.middleware.splice(startLength, middlewareLength, ..._middlewares);
      middlewareLength = _middlewares.length;
      ctx.beforeAndCoreMiddlewareNumber = startLength + middlewareLength;

      await next();
    } catch (err) {
      error = err;
    }

    if (error) {
      throw error;
    }
  }

  return [coreHmrMiddleware, ...newMiddlewares];
}
