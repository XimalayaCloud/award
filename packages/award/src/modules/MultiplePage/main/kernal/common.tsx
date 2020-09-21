/**
 * 公共方法类
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { loadBundles, loadInitialProps, setAward, Exception, queryObj } from 'award-utils';
import { MatchedRoute } from 'award-types';
import clientPlugin from 'award-plugin/client';

import Base from './base';
import { ILifeCycletoFrom } from './type';

export default class Common extends Base {
  public setParam(_location: {
    pathname: string;
    search: string;
    data?: {
      scroll: boolean;
      x: number;
      y: number;
    };
  }) {
    // 记录是否回到顶部参数
    let x = 0;
    let y = 0;
    let scroll = true;

    if (_location.data) {
      if (typeof _location.data.scroll === 'boolean') {
        scroll = _location.data.scroll;
      }
      if (_location.data.x) {
        x = _location.data.x;
      }
      if (_location.data.y) {
        y = _location.data.y;
      }
    }

    this.scrollParam = { x, y, scroll };
  }

  // 加载代码拆分后的静态资源
  public loadBundles(
    new_match_routes: Array<MatchedRoute<{}>>,
    _location: {
      pathname: string;
      search: string;
    }
  ) {
    // 加载下个路由对应页面的所有的jsBundle
    return loadBundles(
      new_match_routes,
      _location.search.replace(/^\?/, ''),
      this.getInitialState()
    );
  }

  // 加载下个路由需要的数据
  public async loadInitialProps(
    new_match_routes: Array<MatchedRoute<{}>>,
    _location: {
      pathname: string;
      search: string;
    },
    diffRoutes: any,
    pathname: string
  ) {
    let nl = new_match_routes.length;
    let j = 0;
    for (let i = 0; i < nl; i++) {
      if (new_match_routes[i].route.chain) {
        j++;
      }
    }
    if (diffRoutes.length === 0 || nl === j) {
      // eslint-disable-next-line no-param-reassign
      diffRoutes = new_match_routes;
    }
    const search = _location.search.replace(/^\?/, '');
    const needInitiRoutes = diffRoutes.filter((item: any) => {
      if (item.route.chain) {
        return true;
      } else {
        return item.route.needInitiProps;
      }
    });
    if (needInitiRoutes.length) {
      // 切换到下个路由页面之前，需要提取加载数据
      try {
        const initialProps = {
          location: _location,
          query: queryObj(search),
          setAward: setAward.get()
        };
        await clientPlugin.hooks.modifyInitialPropsCtx({
          params: initialProps
        });
        const { props } = await loadInitialProps(
          needInitiRoutes,
          search,
          initialProps,
          new_match_routes
        );
        // 通过RouterSwtich绑定的回调修改数据
        this.updateInitialState &&
          this.updateInitialState({
            award_initialState: props,
            match_routes: new_match_routes,
            diffRoutes,
            pathname,
            location_search: search
          });
      } catch (err) {
        clientPlugin.hooks.catchError({ type: 'fetch', error: err });
        const errorInfo = await Exception.handleError.call(null, err);
        // 发送错误信号
        this.updateInitialState &&
          this.updateInitialState({
            match_routes: new_match_routes,
            diffRoutes,
            pathname,
            error: errorInfo
          });
      }
    } else {
      this.updateInitialState &&
        this.updateInitialState({
          match_routes: new_match_routes,
          diffRoutes,
          pathname,
          location_search: search
        });
    }
  }

  // 显示新的react组件
  public async modal(to: ILifeCycletoFrom, from: ILifeCycletoFrom, component: any) {
    const confirm = await new Promise(resolve => {
      this.PromptContext.setState({
        dom: null
      });

      const modal = ReactDOM.createPortal(
        React.cloneElement(component, {
          to,
          from,
          stop(): any {
            resolve(false);
          },
          pass() {
            resolve(true);
          }
        }),
        document.body
      );
      this.PromptContext.setState({
        dom: modal
      });
    });
    this.PromptContext.setState({
      dom: null
    });
    return confirm;
  }
}
