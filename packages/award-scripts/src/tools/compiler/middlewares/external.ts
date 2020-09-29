/**
 * external外部文件中间件
 * package.json
 * {
 *  external:{
 *   'jquery':'./a.js'
 *  }
 * }
 */
import { IContext } from 'award-types';
import Koa = require('koa');
import * as fs from 'fs-extra';
import * as path from 'path';

const cwd = process.cwd();

/**
 * External中间件
 *
 * 开发环境过滤/external请求开头的资源
 */
export default async function ExternalMiddleware(ctx: IContext, next: Koa.Next) {
  /**
   * 开发环境，每次请求读取配置
   * {
   *   jquery:'a.js'
   * }
   */
  let external = [];
  const pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf-8'));
  if (pkg.external) {
    // key值序列化
    external = pkg.external;
  }

  const reg = /^\/external\//;
  if (reg.test(ctx.request.url)) {
    const source = ctx.request.url.replace(reg, '').replace(/\?(.*)/, '');
    if (source) {
      // 匹配到资源了
      const reSource = external[source];
      if (reSource && !/^http(s)?/.test(reSource) && !/^\//.test(reSource)) {
        const filename = path.join(cwd, reSource);
        if (fs.existsSync(filename)) {
          ctx.status = 200;
          ctx.type = path.extname(ctx.request.url);
          ctx.body = fs.readFileSync(filename);
          return;
        }
      }
    }
  }

  await next();
}
