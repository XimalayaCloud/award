/**
 * 初始化中间件
 */
import { IContext, IServer, IConfig } from 'award-types';
import { getAwardConfig } from 'award-utils/server';
import removeModule = require('../../remove');
import { Seq } from 'immutable';
import { Middleware } from 'koa';
import { loadParams } from 'award-utils';

export default function hmrConfigSource(this: IServer): Middleware<any, IContext> {
  const self = this;
  return async function hmrConfigSourceMiddleware(ctx, next) {
    // 更新Award配置信息
    const originConfig = self.config.toObject() as IConfig;
    if (originConfig.configOrigin) {
      removeModule(originConfig.configOrigin);
    }
    const config: IConfig = getAwardConfig(self.dir, true);
    if (self.dev && !self.apiServer) {
      if (config.assetOrigin) {
        config.assetPrefixs = `http://${config.ip}:${process.env.MAIN_PORT}/award_dev_static/`;
      } else {
        config.assetPrefixs = '/award_dev_static/';
      }
    }
    loadParams.set({ basename: config.basename });
    self.config = Seq(config);
    await next();
  };
}
