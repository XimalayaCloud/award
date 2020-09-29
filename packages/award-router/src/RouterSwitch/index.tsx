/**
 * 路由层面的状态管理中间平台
 * 是联系上层base组件和下层的路由组件的沟通桥梁
 */
import * as React from 'react';
import { Exception, AwardRouterContext, unmountsetState, emitter, loadParams } from 'award-utils';
import clientPlugin from 'award-plugin/client';
import { Redirect } from 'react-router-dom';
import SwitchContext from './context';
import Switch from './Switch';

/**
 * 路由状态管理核心组件
 */
@unmountsetState
class Router extends React.Component<any, any> {
  public static contextType = AwardRouterContext;

  private needUpdateInitialState = true;
  private renderNum: { [pathname: string]: number } = {};

  public constructor(props: any, context: any) {
    super(props, context);
    this.state = {
      award_initialState: context.award_initialState,
      match_routes: context.match_routes,
      pathname: context.pathname,
      diffRoutes: context.match_routes,
      location_search: context.location_search,
      loading: null
    };
    if (process.env.RUN_ENV === 'node') {
      // 确认渲染到路由组件了，便于服务端确认出错是否来自路由内组件渲染
      if (context.routerError && typeof context.routerError === 'function') {
        context.routerError();
      }
    }

    /**
     * 给客户端路由核心处理提供回调
     * 当路由切换前进行数据加载，通过该方法可以更新最新的数据内容
     */
    if (context.updateInitialState) {
      context.updateInitialState(
        ({
          award_initialState = {},
          match_routes,
          diffRoutes,
          location_search = '',
          pathname,
          error = null
        }: any) => {
          /**
           * 这里的回调触发，是在路由切换时，需要加载的一些数据
           * 会通过context回调方式，传到这里，然后会立即更新当前组件
           */
          if (error) {
            // console.log('路由切换前出现错误异常', error);
            this.setState({
              award_initialState: {
                ...this.state.award_initialState,
                AwardException: error
              },
              match_routes,
              diffRoutes,
              pathname,
              location_search
            });
          } else {
            // console.log('路由切换前更新路由核心组件数据');
            this.setState({
              award_initialState: {
                ...this.state.award_initialState,
                ...award_initialState,
                AwardException: null
              },
              match_routes,
              diffRoutes,
              pathname,
              location_search
            });
          }
        }
      );
    }

    // 获取该组件的award_initialState
    if (context.getInitialState) {
      context.getInitialState(() => {
        return this.state.award_initialState;
      });
    }

    if (context.forceRenderRouter) {
      context.forceRenderRouter(() => {
        this.forceUpdate();
      });
    }
  }

  public shouldComponentUpdate(nextProps: any, nextState: any) {
    const cache: any = [];
    Object.keys(nextState.award_initialState).forEach((item) => {
      if (/^\//.test(item)) {
        cache.push(item);
      }
    });

    // 缓存最近8种不同地址的路由数据
    if (cache.length > 8) {
      delete nextState.award_initialState[cache[0]];
    }

    // 保证全局数据的一致性，主要在进行页面切换时，能及时获取缓存数据进行页面响应
    if (process.env.NODE_ENV === 'development') {
      if (this.context.syncInitialState) {
        this.context.syncInitialState(nextState.award_initialState);
      }
    }
    if (!this.needUpdateInitialState) {
      this.needUpdateInitialState = true;
      return false;
    }
    return true;
  }

  public async componentDidCatch(error: any) {
    clientPlugin.hooks.catchError({ type: 'router', error });
    const errorInfo = await Exception.handleError.call(null, error, (component: any) => {
      this.setState({
        loading: component
      });
    });
    this.setState({
      loading: null,
      award_initialState: {
        ...this.state.award_initialState,
        AwardException: errorInfo
      }
    });
  }

  public render() {
    if (!this.context.routes) {
      throw new Error('当前项目使用了路由，但是在编译阶段未识别到，请联系管理员');
    }
    if (this.state.loading) {
      const { loading } = this.state;
      if (React.isValidElement(loading)) {
        return React.cloneElement(
          loading as any,
          typeof loading.type === 'string'
            ? {}
            : { data: this.state.award_initialState, routerError: true }
        );
      }
      if (typeof loading === 'function') {
        return React.createElement(loading, {
          data: this.state.award_initialState,
          routerError: true
        });
      }
      return null;
    }
    const award_initialState = this.state.award_initialState;

    if (award_initialState?.AwardException) {
      const AwardException = award_initialState.AwardException;
      // 如果存在要显示错误的组件
      if (AwardException.url) {
        if (process.env.RUN_ENV === 'web') {
          if (/^http(s)?/.test(AwardException.url)) {
            window.location.href = AwardException.url;
            return null;
          }
        }
        return <Redirect to={AwardException.url} />;
      }
      const ErrorComponent: any = Exception.shot();
      this.needUpdateInitialState = false;
      loadParams.set({ isRenderRouter: false });
      return <ErrorComponent {...AwardException} />;
    }

    // 执行核心路由组件的绘制
    if (!this.renderNum[this.state.pathname] || this.renderNum[this.state.pathname] <= 0) {
      this.renderNum[this.state.pathname] = this.state.diffRoutes.length;
    }
    return (
      <SwitchContext.Provider
        value={{
          updateState: (url: any, data: any) => {
            /**
             * 保持当前控制器的所有数据都是最新的
             * 通过子组件获取然后回调通知当前组件，最后将数据存储到state里面，不做任何渲染
             */
            this.needUpdateInitialState = false;
            const _award_initialState = this.state.award_initialState;
            if (_award_initialState.hasOwnProperty(url)) {
              _award_initialState[url] = {
                ..._award_initialState[url],
                ...data
              };
            } else {
              _award_initialState[url] = data;
            }
            // console.log('更新路由组件变更数据，不导致Router组件渲染');
            this.setState({
              award_initialState: {
                ...this.state.award_initialState,
                ..._award_initialState
              }
            });
          },
          updateError: (err: any) => {
            // console.log('更新路由组件时发生错误，会直接展示错误');
            this.setState({
              award_initialState: {
                ...this.state.award_initialState,
                AwardException: err
              }
            });
          },
          routerDidUpdate: (fn: Function, data: any) => {
            setTimeout(() => {
              if (fn) {
                emitter.getEmitter().emit('routeDidUpdate', {
                  data: { ...data, __award__data__: this.state.award_initialState },
                  fn
                });
              }

              if (typeof this.renderNum[this.state.pathname] !== 'undefined') {
                this.renderNum[this.state.pathname]--;
              }

              if (this.renderNum[this.state.pathname] === 0) {
                console.log('路由切换渲染以及数据更新完毕');
                emitter.getEmitter().emit('routerDidUpdate', this.state.award_initialState);
              }
            }, 0);
          },
          data: this.state.award_initialState,
          match_routes: this.state.match_routes,
          location_search: this.state.location_search,
          updateProps: this.context.updateProps,
          isRender: this.context.isRender
        }}
      >
        <Switch routes={this.context.routes} />
      </SwitchContext.Provider>
    );
  }
}

/**
 * 负责Award框架路由整体调度的组件
 *
## 示例
```jsx
<RouterSwitch>
  <Route path="/" component={() => null} redirect="/home" exact />
  <Route path="/user/:id" component={User}>
    <Route path="/user/:id/post/:postId" component={UserPost} exact />
    <Route path="/user/:id/profile" component={UserProfile} exact />
  </Route>
  <Route path="/test" component={Test} />
  <Route path="/about" component={About} exact />
  <Route path="/home" component={Home} exact />
  <Route path="/404" component={() => <h1>404!</h1>} exact />
  <Route redirect="/404" />
</RouterSwitch>
```
 */
export default class RouterSwitch extends React.Component {
  public shouldComponentUpdate() {
    return false;
  }

  public render() {
    if (this.props.children) {
      return <Router />;
    }
    return null;
  }
}
