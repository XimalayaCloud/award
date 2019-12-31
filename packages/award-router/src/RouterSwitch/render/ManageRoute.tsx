import * as React from 'react';
import { realPath, pathname, loadParams, search } from 'award-utils';
import AsyncRender from './AsyncRender';

export default class ManageRoute extends React.Component<any> {
  /**
   * 路由切换，必定会导致pathname发生变化
   *
   * 但是在切换之前，我们会传入新的match_routes
   * 而这个时候，路由的pathname还没有更新，所以，必须阻止渲染
   */
  public shouldComponentUpdate(nextProps: any) {
    if (nextProps.pathname === this.props.pathname) {
      const { basename } = loadParams.get();

      // 判断当前地址是否和切换的目标地址一致
      if (realPath(basename, pathname()) === nextProps.pathname) {
        if (nextProps.consumer.location_search !== search()) {
          return false;
        }
      }
    }

    return true;
  }

  public render() {
    const {
      match_routes,
      location_search,
      data,
      updateError,
      updateState,
      routerDidUpdate,
      updateProps,
      isRender
    }: any = this.props.consumer;
    if (isRender && typeof isRender === 'function') {
      if (!isRender()) {
        return null;
      }
    }
    const { path, props, childRoutes } = this.props.rest;
    const match_routes_length = match_routes.length;
    if (match_routes_length === 0) {
      return null;
    }
    let router;
    let _props = {};
    let hasRender = false;

    for (let i = 0; i < match_routes_length; i++) {
      router = match_routes[i];
      const match = router.match;
      if (match.path === path) {
        const _search =
          i === match_routes_length - 1 && location_search ? '?' + location_search : '';
        const key = match.url + _search;
        if (data.hasOwnProperty(key)) {
          _props = (data as any)[key];
          hasRender = true;
        }
        break;
      }
    }

    const url = router.match.url + (location_search ? '?' + location_search : '');
    return (
      <AsyncRender
        /**
         *  整合路由组件主动传入的props和路由组件本身的props
         *
         *  props:  <Route render={(props)=><Component {...props}/>} />
         *  _props: Component Data
         */
        path={path}
        router={router}
        url={url}
        data={{ ...props, ..._props }}
        hasRender={hasRender}
        updateError={updateError}
        updateState={updateState}
        routerDidUpdate={routerDidUpdate}
        updateProps={updateProps}
      >
        {childRoutes}
      </AsyncRender>
    );
  }
}
