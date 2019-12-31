/**
 * external外部文件中间件
 * package.json
 * {
 *  external:{
 *   'jquery':'./a.js'
 *  }
 * }
 */
import { IConfig, IServer, IContext } from 'award-types';
import { Middleware } from 'koa';
import * as fs from 'fs-extra';
import * as path from 'path';

/**
 * External中间件
 *
 * 开发环境过滤/external请求开头的资源
 */
export default function External(this: IServer): Middleware<any, IContext> {
  const external: any =
    JSON.parse(fs.readFileSync(path.join(this.dir, 'package.json'), 'utf-8')).external || {};

  const self = this;
  return async function ExternalMiddleware(ctx: IContext, next: any) {
    const config = self.config.toObject() as IConfig;

    const { assetPrefixs } = config;

    // http  //
    if (!/^http(s)?/.test(assetPrefixs) && !/^\/\//.test(assetPrefixs)) {
      const pathname = assetPrefixs + 'external/';

      // <assetPrefixs>external/a.js
      const reg = new RegExp(`^${pathname}`);
      if (reg.test(ctx.request.url)) {
        const source = ctx.request.url.replace(reg, '').replace(/\?(.*)/, '');
        if (source) {
          // 匹配到资源了
          const reSource = external[source];
          if (reSource && !/^http(s)?/.test(reSource) && !/^\//.test(reSource)) {
            const filename = path.join(self.dir, reSource);
            if (fs.existsSync(filename)) {
              ctx.status = 200;
              ctx.type = path.extname(ctx.request.url);
              ctx.body = fs.readFileSync(filename);
              return;
            }
          }
        }
      }
    }
    await next();
  };
}
