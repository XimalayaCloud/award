/* eslint-disable no-param-reassign */
/**
 * Award客户端核心代码
 */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as Loadable from 'react-loadable';
import { Routes, AComponentType } from 'award-types';
import loadParams from 'award-utils/loadParams';
import createContext from './createContext';
import createIntialState, { INITIAL_STATE } from '../../shared/initial_state';
import clientPlugin from 'award-plugin/client';
// 初始化路由
let routes: Routes;

const parseComponent = (Component: AComponentType): Promise<AComponentType> => {
  let parse: Function;
  if (process.env.NODE_ENV === 'development') {
    if (routes?.length) {
      parse = require('../../modules/MultiplePage');
    } else {
      parse = require('../../modules/SinglePage');
    }
  } else {
    if (process.env.USE_ROUTE === '1') {
      parse = require('../../modules/MultiplePage');
    } else {
      parse = require('../../modules/SinglePage');
    }
  }
  return parse(Component, INITIAL_STATE, routes);
};

// 给元素添加remove polyfill
// 针对IE8及其以下的，请自行添加Object polyfill进行处理
(function (arr) {
  arr.forEach(function (item) {
    if (item.hasOwnProperty('remove')) {
      return;
    }
    Object.defineProperty(item, 'remove', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: function value() {
        if (this.parentNode === null) {
          return;
        }
        this.parentNode.removeChild(this);
      }
    });
  });
})([Element.prototype, CharacterData.prototype, DocumentType.prototype]);

const startWeb = async (Component: AComponentType, hot: Function | null = null) => {
  let customDom = null;
  const __URL__ = document.getElementById('__URL__');
  let ssr = false;
  if (__URL__) {
    ssr = true;
  }

  if (!ssr) {
    customDom = clientPlugin.hooks.mount();
  }

  if (!document.getElementById('award') && !customDom) {
    document.body.innerHTML = '不存在名称为【award】的id选择器';
    return;
  }

  // 延迟执行-预加载
  await new Promise((resolve) => {
    resolve(null);
  });
  createIntialState();
  await Loadable.preloadAll();
  /**
   * 服务端渲染会存在id 为 __URL__的选择器
   */
  let render = ReactDOM.render;
  if (__URL__) {
    const value = __URL__.getAttribute('data-loadable');
    if (value && Number(value) === 0) {
      render = ReactDOM.hydrate;
    }
    if (process.env.NODE_ENV !== 'development') {
      __URL__.remove();
    }
  }

  // 读取路由数据
  routes = window.__AWARD__INIT__ROUTES__ || [];

  // 存储全局变量
  loadParams.set({
    firstRender: true,
    ssr,
    routes
  });

  // 生产环境清除全局变量标记
  if (process.env.NODE_ENV !== 'development') {
    delete (window as any).__AWARD__INIT__ROUTES__;
    delete window.__INITIAL_STATE__;
  }

  // 渲染组件
  const ComponentType = await parseComponent(Component);

  // 如果发现有路由需要客户端渲染，那么需要使用ReactDOM.render
  if (ComponentType.needClient) {
    render = ReactDOM.render;
  }

  const RootComponent = createContext({
    Component: ComponentType,
    INITIAL_STATE
  });

  if (process.env.NODE_ENV === 'development') {
    hot?.(ComponentType);
    hot?.(RootComponent);
  }

  render(<RootComponent />, customDom || document.getElementById('award'), () => {
    loadParams.set({ firstRender: false });
    clientPlugin.hooks.rendered({
      Component
    });
  });
};

module.exports = startWeb;
