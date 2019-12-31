import * as React from 'react';
import * as Loadable from 'react-loadable';

import { IContext } from 'award-types';
import { StaticRouter } from 'react-router-dom';
import { AwardRouterContext, AwardContext } from 'award-utils';
import root from './root';

export default (ctx: IContext) => {
  const RootComponent = root(ctx);

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
