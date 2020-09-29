/**
 * 静态资源中间件
 */
import * as koaStatic from 'koa-static';
import * as koaMount from 'koa-mount';
import * as Koa from 'koa';
import { join } from 'path';
import { IConfig, IServer, IContext } from 'award-types';
import CommonMiddleware from '../common';

export default function (this: IServer): Koa.Middleware<any, IContext> {
  /** 生产环境注册静态资源服务 */
  /** 开发环境的静态资源由webpack提供的 */
  if (!this.dev && !this.apiServer) {
    const config = this.config.toObject() as IConfig;
    const { assetPrefixs, client_dist, basename } = config;
    const clientDir = join(this.dir, client_dist);

    /**
     * 当前静态资源设置的前缀地址不携带http，就表示当前的静态资源在当前服务下，那么就会自动启动静态服务器
     */
    if (assetPrefixs === '/') {
      return koaStatic(clientDir);
    } else if (!/^http(s)?/.test(assetPrefixs) && !/^\/\//.test(assetPrefixs)) {
      // 指定的非http开头的入口静态资源引用地址
      const app = new Koa();
      return koaMount(assetPrefixs.replace(basename, ''), app.use(koaStatic(clientDir)));
    }
  }
  return CommonMiddleware;
}
