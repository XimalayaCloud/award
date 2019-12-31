/**
 * 开发环境加载入口文件
 */
import * as React from 'react';
import { StaticRouter, withRouter } from 'react-router-dom';
import { AwardRouterContext, routeComponents } from 'award-utils';
import { IContext } from 'award-types';
import { matchRoutes } from 'react-router-config';
import nodePlugin from 'award-plugin/node';
import * as Loadable from 'react-loadable';

export default async (ctx: IContext) => {
  await Loadable.preloadAll();
  ctx.award.match_routes = ctx.award.routes.length
    ? matchRoutes(ctx.award.routes, ctx.award.url)
    : [];
  ctx.award.match_routes.forEach((item: any) => {
    const route = item.route;
    routeComponents.set(route.path, route.component);
  });

  await nodePlugin.hooks.modifyContextAward({
    context: ctx
  });

  const RootComponent = withRouter(ctx.award.RootComponent as React.FC);

  const Component = () => (
    <StaticRouter location={ctx.award.url} context={{}}>
      <AwardRouterContext.Provider
        value={{
          cache: true,
          routes: ctx.award.routes,
          match_routes: ctx.award.match_routes,
          award_initialState: ctx.award.initialState,
          location_search: ctx.award.search,
          match: ctx.award.match,
          pathname: ctx.award.url
        }}
      >
        <Loadable.Capture report={(moduleName: any) => ctx.award.modules.push(moduleName)}>
          <RootComponent {...(ctx.award.initialState.award || {})} />
        </Loadable.Capture>
      </AwardRouterContext.Provider>
    </StaticRouter>
  );
  return Component;
};
