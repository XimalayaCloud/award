/**
 * 针对award-router库的功能进行协调测试
 */
import * as React from 'react';
import { mountStart, createDOM } from '../../utils';

window.scrollTo = jest.fn();

const commonDOM = `<a href="/about/1">/about/1</a><a href="/about/2">/about/2</a><a href="/home">/home</a>`;

describe('award-router', () => {
  beforeEach(() => {
    delete window.jestMock;
    jest.resetAllMocks();
    jest.resetModules();
    history.replaceState({}, '', '/');
    createDOM();
    process.env.USE_ROUTE = '1';
    process.env.NODE_ENV = 'production';
    process.env.RUN_ENV = 'web';
    const home = (callback: Function) => {
      callback(require('@/fixtures/basic-router/change-loading/pages/home'));
    };
    const about = (callback: Function) => {
      callback(require('@/fixtures/basic-router/change-loading/pages/about'));
    };
    window.__AWARD__INIT__ROUTES__ = [
      {
        path: '/home',
        component: home,
        exact: true,
        loading: <p>loading...home</p>
      },
      {
        path: '/about/:id',
        component: about,
        loading: () => <p>loading...home</p>
      }
    ];
    window.__INITIAL_STATE__ = {};
    const __URL__ = document.getElementById('__URL__');
    if (__URL__) {
      __URL__.remove();
    }
  });

  it('测试路由切换 loading', done => {
    mountStart(async wrapper => {
      const { history } = require('award-router');
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe(commonDOM);

      // 路由切换/about/1
      history.push('/about/1');
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe(commonDOM + `<p>age:123</p><p>name:</p><p>hello </p>`);

      await new Promise(resolve => setTimeout(resolve, 200));
      wrapper.update();
      expect(wrapper.html()).toBe(commonDOM + `<p>age:123</p><p>name:hello</p><p>hello 1</p>`);

      // 路由切换/home
      history.push('/home');
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe(commonDOM + `<p>loading...home</p>`);

      await new Promise(resolve => setTimeout(resolve, 200));
      wrapper.update();
      expect(wrapper.html()).toBe(commonDOM + `<p>hello home</p>`);

      done();
    });
    require('@/fixtures/basic-router/change-loading/index.tsx');
  });
});
