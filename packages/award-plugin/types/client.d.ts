import { MatchedRoutes, IinitState, AComponentType } from 'award-types';

export interface Iinit {
  /** 服务端返回的数据集合 */
  INITIAL_STATE: IinitState;

  /** 匹配到的路由 */
  match_routes: MatchedRoutes<{}>;

  /** 根组件、即入口组件 */
  Component: AComponentType;
}

export type mount = (callback: () => HTMLElement) => void;

export type init = (callback: (this: { config: any }, params: Iinit) => void) => void;

export interface IrouteChangeBeforeLoadInitialProps {
  /** 全局事件监听对象 */
  emitter: {
    emit: (name: string, data: any) => void;
  };
  /** 匹配到的路由 */
  match_routes: MatchedRoutes<{}>;
}
export type routeChangeBeforeLoadInitialProps = (
  callback: (this: { config: any }, params: IrouteChangeBeforeLoadInitialProps) => void
) => void;

export interface ImodifyInitialPropsCtx {
  params: any;
}
export type modifyInitialPropsCtx = (
  callback: (this: { config: any }, params: ImodifyInitialPropsCtx) => void
) => void;

export interface Irendered {
  /** 根组件、即入口组件 */
  Component: AComponentType;
}
export type rendered = (callback: (this: { config: any }, params: Irendered) => void) => void;

export interface IcatchError {
  type: 'global' | 'router' | 'fetch';
  error: any;
}
export type catchError = (callback: (this: { config: any }, params: IcatchError) => void) => void;

export interface ClientHooks {
  init: init;
  rendered: rendered;
  modifyInitialPropsCtx: modifyInitialPropsCtx;
  routeChangeBeforeLoadInitialProps: routeChangeBeforeLoadInitialProps;
  catchError: catchError;
}
