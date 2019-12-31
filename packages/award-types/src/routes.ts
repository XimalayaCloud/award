/* eslint-disable @typescript-eslint/no-empty-interface */
import { match } from 'react-router-dom';
import { RouteConfig, MatchedRoute as _MRoute } from 'react-router-config';
import { ICtx } from './ctx';
import { IAny } from './util';
import { Model } from './model';
// import { AComponentType } from './component';

export interface Route extends RouteConfig {
  // component?: AComponentType<RouteConfigComponentProps<any>>;
  component?: RouteConfig['component'] & {
    getInitialProps?: (ctx: ICtx) => IAny;
    model?: Model | Model[];
  };
  loading?: boolean;
  needInitiProps?: boolean;
  redirect?: (from: string, match: match<{}>) => string | string;
  /** 路由是同步组件 */
  sync?: boolean;
  /** 组件是否异步加载过 */
  componentLoaded?: boolean;
  client?: boolean;
}

export interface Routes extends Array<Route> {}

export interface MatchedRoute<Params extends { [K in keyof Params]?: string } = {}>
  extends _MRoute<Params> {
  route: Route;
}
