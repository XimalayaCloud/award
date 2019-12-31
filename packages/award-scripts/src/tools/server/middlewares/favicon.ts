/**
 * 初始化中间件
 */
import * as fs from 'fs-extra';
import { join } from 'path';
import { IContext, IServer } from 'award-types';
import { Middleware } from 'koa';

export default function hmrEntrySource(this: IServer): Middleware<any, IContext> {
  const self = this;
  return async function favicon(ctx, next) {
    if (ctx.request.url === '/favicon.ico') {
      // favicon
      const ico = join(self.dir, 'favicon.ico');
      if (fs.existsSync(ico)) {
        self.favicon = fs.readFileSync(ico);
      }
    }
    await next();
  };
}
