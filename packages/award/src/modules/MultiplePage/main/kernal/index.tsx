/**
 * 开始渲染核心路由组件，继承方式
 * index > kernal-component -> lifecycle -> common -> base
 */
import * as React from 'react';
import { loadParams, Exception } from 'award-utils';
import { IinitState, Routes, AComponentType, MatchedRoute } from 'award-types';
import clientPlugin from 'award-plugin/client';

import KernalComponent from './kernal-component';

import { routerDidUpdate } from '../utils/routerLifecycle';

export default (
  routes: Routes,
  match_routes: Array<MatchedRoute<{}>>,
  INITIAL_STATE: IinitState,
  Component: AComponentType
): any =>
  /**
   * 入口组件渲染，处理react生命周期
   */
  class AwardRouter extends KernalComponent {
    public constructor(props: any, context: any) {
      super(props, context, [Component, routes, match_routes, INITIAL_STATE]);
      let errorInfo = null;
      // webpack会删除该段代码
      if (process.env.NODE_ENV === 'development') {
        if (window.award_hmr && window.award_hmr_error) {
          // 热更新
          errorInfo = window.award_hmr_error;
        }
      }

      // 正常渲染，且发生的错误是路由外的才录用
      if (!errorInfo && INITIAL_STATE.AwardException && !INITIAL_STATE.AwardException.routerError) {
        errorInfo = INITIAL_STATE.AwardException;
      }

      this.state = {
        errorInfo,
        loading: null,
        data: INITIAL_STATE.award
      };
    }

    public shouldComponentUpdate(nextProps: any, nextState: any) {
      if (process.env.NODE_ENV === 'development') {
        if (window.award_hmr) {
          return true;
        }
      }
      if (
        this.state.loading !== nextState.loading ||
        this.state.errorInfo !== nextState.errorInfo
      ) {
        return true;
      }
      return false;
    }

    public async componentDidMount() {
      let pass = true;
      if (process.env.NODE_ENV === 'development') {
        if (window.award_hmr) {
          this.emitter.off('routeDidUpdate');
          this.emitter.off('routerDidUpdate');
          pass = false;
        }
      }

      if (pass) {
        const { firstRender, ssr } = loadParams.get();
        if (firstRender && !ssr && this.history) {
          // 首次渲染结束触发,触发重定向
          this.emitter.emit('routerWillUpdate_!ssr', this.history);
        }
      }

      // 监听单个路由的切换
      this.emitter.on('routeDidUpdate', (info: any) => {
        if (pass) {
          const { fn, data } = info;
          const to = this.target;
          const from = this.lastTarget;
          fn(to, from, data);
        } else {
          pass = true;
        }
      });

      // 监听全局路由的切换
      this.emitter.on('routerDidUpdate', (data: any) => {
        if (pass) {
          routerDidUpdate({
            to: this.target,
            from: this.lastTarget,
            data
          });
        } else {
          pass = true;
        }
      });

      // 如果发生错误了，将立刻触发routerDidUpdate
      if (INITIAL_STATE && INITIAL_STATE.AwardException) {
        this.emitter.emit('routerDidUpdate', INITIAL_STATE);
      }
    }

    public async componentDidCatch(error: any) {
      clientPlugin.hooks.catchError({ type: 'global', error });
      const message = error.message ? error.message : null;
      const stack = error.stack ? error.stack : null;
      const errorInfo = await Exception.handleError.call(
        null,
        {
          message,
          stack,
          routerError: false
        },
        (component: any) => {
          this.setState({
            loading: component
          });
        }
      );
      if (process.env.NODE_ENV === 'development') {
        window.award_hmr_error = errorInfo;
      }
      this.setState({
        errorInfo,
        loading: null
      });
    }

    public render() {
      if (this.state.loading) {
        const { loading } = this.state;
        if (React.isValidElement(loading)) {
          return React.cloneElement(
            loading as any,
            typeof loading.type === 'string' ? {} : { data: INITIAL_STATE, routerError: false }
          );
        }
        if (typeof loading === 'function') {
          return React.createElement(loading, {
            data: INITIAL_STATE,
            routerError: false
          });
        }
        return null;
      }

      if (this.state.errorInfo) {
        const ErrorComponent = Exception.shot();
        const redirect = (url: string) => {
          if (!/^http(s)?:/.test(url)) {
            const { basename } = loadParams.get();
            window.location.href = basename + url;
          } else {
            window.location.href = url;
          }
        };
        return <ErrorComponent {...this.state.errorInfo} redirect={redirect} />;
      }
      const Provider = this.provider();
      const Router = this.router();
      const Root = this.root();
      const Prompt = this.prompt();
      return (
        <Provider>
          <Router>
            <Prompt />
            <Root>
              <Component />
            </Root>
          </Router>
        </Provider>
      );
    }
  };
