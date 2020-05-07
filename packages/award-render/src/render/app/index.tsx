import * as React from 'react';
import * as Loadable from 'react-loadable';

import { IContext } from 'award-types';
import { StaticRouter } from 'react-router-dom';
import { AwardRouterContext, AwardContext } from 'award-utils';
import root from './root';

export default (ctx: IContext) => {
  const RootComponent = root(ctx);

  if (ctx.award.error && !ctx.award.routerError) {
    // 发生全局错误了
    return RootComponent;
  }

  if (!ctx.award.routes.length) {
    // 无路由的页面
    let Component: any = () => null;
    const { mode } = ctx.award.config;
    if (mode === 'server') {
      Component = ctx.award.RootComponent as React.FC;
    }
    return () => (
      <AwardContext.Provider value={(ctx.award.initialState as any).award || {}}>
        <Loadable.Capture report={(moduleName: any) => ctx.award.modules.push(moduleName)}>
          <Component {...(ctx.award.initialState.award || {})} />
        </Loadable.Capture>
      </AwardContext.Provider>
    );
  }

  let locationUrl = ctx.request.url;
  const basename = ctx.award.config.basename;
  let originalUrl = ctx.originalUrl;
  if (basename) {
    if (new RegExp('^' + basename).test(locationUrl)) {
      locationUrl = basename + locationUrl;
    }

    if (new RegExp('^' + basename).test(originalUrl)) {
      originalUrl = basename + originalUrl;
    }
  }

  return () => (
    <AwardContext.Provider value={(ctx.award.initialState as any).award || {}}>
      <StaticRouter basename={basename} location={locationUrl} context={{}}>
        <AwardRouterContext.Provider
          value={{
            cache: ctx.award.cache,
            routes: ctx.award.routes,
            match_routes: ctx.award.match_routes,
            award_initialState: ctx.award.initialState,
            location_search: ctx.award.search,
            match: ctx.award.match,
            pathname: originalUrl.split('?')[0],
            routerError: () => {
              // 标识路由错误
              ctx.award.routerError = true;
            }
          }}
        >
          <Loadable.Capture report={(moduleName: any) => ctx.award.modules.push(moduleName)}>
            <RootComponent />
          </Loadable.Capture>
        </AwardRouterContext.Provider>
      </StaticRouter>
    </AwardContext.Provider>
  );
};
