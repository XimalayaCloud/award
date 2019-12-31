/**
 * 路由切换加载数据发生了错误
 */
import * as React from 'react';
import { mountStart, createDOM } from '../../utils';

window.scrollTo = jest.fn();

describe('路由切换加载数据发生了错误', () => {
  beforeEach(() => {
    delete window.jestMock;
    jest.resetAllMocks();
    jest.resetModules();
    history.replaceState({}, '', '/');
    createDOM();
    process.env.USE_ROUTE = '1';
    process.env.NODE_ENV = 'production';
    const home = (callback: Function) => {
      callback(require('@/fixtures/basic-router/routeUpdateProps/routes/a/pages/home'));
    };
    const about = (callback: Function) => {
      callback(require('@/fixtures/basic-router/routeUpdateProps/routes/a/pages/about'));
    };
    const detail = (callback: Function) => {
      callback(require('@/fixtures/basic-router/routeUpdateProps/routes/a/pages/detail'));
    };
    window.__AWARD__INIT__ROUTES__ = [
      {
        path: '/home',
        component: home,
        exact: true
      },
      {
        path: '/about/:id',
        component: about
      },
      {
        path: '/detail/:id',
        component: detail,
        client: true,
        loading: () => <p>loading...</p>
      }
    ];
    window.__INITIAL_STATE__ = {};
    const __URL__ = document.getElementById('__URL__');
    if (__URL__) {
      __URL__.remove();
    }
  });

  it('路由切换常规错误测试', done => {
    mountStart(async wrapper => {
      const { history } = require('award-router');

      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      // 发生错误，路由重定向到/home
      history.push('/detail/1');
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>loading...</p>');

      await new Promise(resolve => setTimeout(resolve, 500));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home1</p></div>');
      done();
    });
    require('@/fixtures/basic-router/routeUpdateProps/main/a');
  });
});
