import { IContext, IServer } from 'award-types';
import { Middleware } from 'koa';
import * as httpProxy from 'http-proxy-middleware';
import k2c = require('koa2-connect');

export default function (this: IServer): Middleware<any, IContext> {
  return async function staticProxyMiddleware(ctx, next) {
    if (/^\/award_dev_static/.test(ctx.request.url)) {
      // 表示award开发环境静态资源地址前缀
      // eslint-disable-next-line no-return-await
      return await k2c(
        httpProxy(ctx.path, {
          target: `http://127.0.0.1:${process.env.CHILDPROCESS_COMPILER_PORT}`,
          pathRewrite: {
            '^/award_dev_static': '/'
          },
          logLevel: 'silent'
        })
      )(ctx, next);
    }
    await next();
  };
}
