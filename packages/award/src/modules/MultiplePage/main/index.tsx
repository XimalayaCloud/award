import * as React from 'react';
import { matchRoutes } from 'react-router-config';
import {
  realPath,
  pathname,
  search,
  loadBundles,
  Exception,
  redirect,
  loadParams
} from 'award-utils';
import clientPlugin from 'award-plugin/client';
import { IinitState, AComponentType, Routes } from 'award-types';
import AwardRouterCore from './kernal';
import { routerWillUpdate, routerDidUpdate } from './utils/routerLifecycle';

import findDiff from './utils/routesDiff';
import fetchInitialState from './utils/fetch';
import RedirectFunction from './utils/redirect';
/**
 * 客户端代码首次渲染执行
 */
async function RouteEntry(
  Component: AComponentType,
  INITIAL_STATE: IinitState,
  routes: Routes
): Promise<[AComponentType, boolean]> {
  let needClient = false;
  try {
    // 存储路由生命周期钩子函数
    routerWillUpdate.set(Component);
    routerDidUpdate.set(Component);

    const { ssr, basename } = loadParams.get();

    // 当前项目没有设置路由，且发生错误了，需要直接渲染错误页面
    const locationInfo: any = realPath(basename, pathname());
    let match_routes = matchRoutes(routes, locationInfo);
    let match_length = match_routes.length;

    /**
     * 不涉及组件层面的处理，不需要进行loadBundle
     */

    // 匹配到路由了
    if (match_length) {
      // 触发第一个match_routes记录
      findDiff(match_routes, search());
    }

    // 客户端渲染和热更新时触发当前条件
    if (!ssr) {
      /**
       * 判断重定向，如果是服务器执行，服务端会优先执行重定向
       * 如果纯客户端执行代码，这里客户端会进行浏览器跳转刷新
       */
      const redirectUrl = await RedirectFunction(match_routes, match_length, locationInfo);
      if (redirectUrl) {
        redirect(redirectUrl);
        return [() => null, needClient];
      }
    }

    // 如果最后匹配到的路由path没有定义
    /** 如果最后匹配到的路由path没有定义 */
    let match = true;
    if (match_length) {
      // <Route />
      const info = match_routes[match_length - 1];
      if (Object.keys(info.route).length === 0) {
        match = false;
      }
    } else {
      if (locationInfo !== '/') {
        match = false;
      }
    }

    // 加载对应路由的js-bundle，初始化路由对应的组件
    // webpack会删除该段代码
    if (process.env.NODE_ENV === 'development') {
      INITIAL_STATE = window.hmr_initialState || INITIAL_STATE;
    }
    await loadBundles(match_routes, search(), INITIAL_STATE);

    // 判断是否阻止通过，即当热更新时，阻止某些代码执行
    let pass = true;
    // webpack会删除该段代码
    if (process.env.NODE_ENV === 'development') {
      if (window.award_hmr) {
        pass = false;
      }
    }

    if (pass) {
      // 执行初始化插件
      await clientPlugin.hooks.init({
        Component,
        INITIAL_STATE,
        match_routes
      });
    }

    /**
     * 热更新不执行
     */
    if (pass) {
      // 获取数据
      needClient = await fetchInitialState(Component, match_routes, INITIAL_STATE);
      // 客户端直接渲染404页面
      if (!INITIAL_STATE.AwardException || INITIAL_STATE.AwardException.status !== 404) {
        if (!match) {
          INITIAL_STATE.AwardException = await Exception.handleError.call(null, {
            status: 404
          });
        }
      }
      // 触发路由更新前钩子
      if (
        !(await routerWillUpdate({
          to: {
            match_routes,
            location: {
              pathname: locationInfo
            }
          },
          from: {},
          history: {},
          data: INITIAL_STATE
        }))
      ) {
        return [() => null, needClient];
      }
    }

    // 注册路由组件
    return [AwardRouterCore(routes, match_routes, INITIAL_STATE, Component), needClient];
  } catch (error) {
    console.error('客户端初始化代码出错', error);
    return [() => <p>网站奔溃了，请联系网站管理员</p>, needClient];
  }
}

export default async (Component: AComponentType, INITIAL_STATE: IinitState, routes: Routes) => {
  const [ComponentType, needClient] = await RouteEntry(Component, INITIAL_STATE, routes);
  ComponentType.needClient = needClient;
  return ComponentType;
};
