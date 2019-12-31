/**
 * 路由别名中间件
 */
import { IServer, IContext } from 'award-types';
import { Middleware } from 'koa';
import enforceHttps from 'koa-sslify';
import CommonMiddleware from '../common';

export default function httpsMiddleware(this: IServer): Middleware<any, IContext> {
  /**
   * 如果端口是443使用https
   */
  if (this.port === '443') {
    return enforceHttps(this.httpsOptions);
  }
  return CommonMiddleware;
}
