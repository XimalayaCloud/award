import { IContext } from 'award-types';

import Html from '../html';
import document from './document';
import app from './app';

export default async (ctx: IContext, renderReactToString: Function | null) => {
  // render时间log
  const _startTime = Number(new Date());
  ctx.award.RootComponent = app(ctx);
  try {
    // 根据cache判断返回html还是数据结构
    return await Html(
      ctx,
      document({
        url: ctx.request.url,
        mode: ctx.award.config.mode,
        hashName: ctx.award.config.hashName,
        router: ctx.award.config.router,
        dev: ctx.award.dev,
        map: ctx.award.map,
        manifest: ctx.award.manifest,
        cache: ctx.award.cache,
        initialState: ctx.award.initialState,
        assetPrefixs: ctx.award.config.assetPrefixs,
        crossOrigin: ctx.award.config.crossOrigin,
        error: ctx.award.error,
        modules: ctx.award.modules
      }),
      renderReactToString
    );
  } catch (error) {
    ctx.award.error = true;
    throw error;
  } finally {
    ctx.renderTime = Number(new Date()) - _startTime;
  }
};
