/**
 * 开始渲染核心路由组件，继承方式
 * index > kernal-component -> lifecycle -> common -> base
 */
import * as React from 'react';
import { loadParams } from 'award-utils';
import { IinitState, Routes, AComponentType, MatchedRoute } from 'award-types';

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
    }

    public shouldComponentUpdate() {
      if (process.env.NODE_ENV === 'development') {
        if (window.award_hmr) {
          return true;
        }
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

    public render() {
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
