/**
 * 测试无路由的单页应用
 */
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { start, mountStart, createDOM } from '../utils';

describe('测试服务端执行start函数', () => {
  it('常规测试', () => {
    process.env.RUN_ENV = 'node';
    let RootComponent: any = null;
    global.AppRegistry = (Component: any) => {
      RootComponent = Component;
    };
    require('@/fixtures/basic/examples/a');
    expect(renderToStaticMarkup(<RootComponent />)).toBe('<h1>hello world</h1>');
  });
});

describe('测试客户端执行start函数 - 生产环境', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'production';
    process.env.RUN_ENV = 'web';
  });

  beforeEach(() => {
    window.__INITIAL_STATE__ = {
      award: {}
    };
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.resetModules();
    history.replaceState({}, '', '/');
    createDOM();
  });

  it('常规测试', done => {
    const { loadParams } = require('award-utils');
    expect(loadParams.get().firstRender).toBeTruthy();
    start(() => {
      const award: any = document.getElementById('award');
      expect(award.innerHTML).toBe('<h1>hello world</h1>');
      expect(loadParams.get().firstRender).toBeFalsy();
      done();
    });
    require('@/fixtures/basic/examples/a');
  });

  it('测试reloadInitialProps的函数调用', done => {
    mountStart(wrapper => {
      expect(wrapper.html()).toBe(`<h1>hello world</h1>`);
      history.replaceState({}, 'About', '/about?id=1');
      const warn = jest.spyOn(console, 'warn');
      wrapper
        .find('h1')
        .at(0)
        .simulate('click');
      wrapper
        .find('h1')
        .at(0)
        .simulate('click');
      expect(warn).toHaveBeenCalledWith(
        '当前根组件正在执行reloadInitialProps函数，请等待执行完毕！'
      );
      setTimeout(() => {
        expect(wrapper.html()).toBe(`<h1>hello world1</h1>`);
        done();
      }, 100);
    });
    require('@/fixtures/basic/examples/b');
  });

  it('props使用了系统关键字reloadInitialProps', done => {
    window.__INITIAL_STATE__ = {
      award: {
        reloadInitialProps: null
      }
    };
    mountStart((wrapper, err) => {
      expect(err.message).toEqual('reloadInitialProps这是系统关键字，请不要使用该名称作为key');
      done();
    });
    require('@/fixtures/basic/examples/b');
  });

  it('测试updateProps boolean', done => {
    window.jestMock = jest.fn();
    mountStart(() => {
      expect(window.jestMock).toHaveBeenCalledTimes(1);
      done();
    });
    require('@/fixtures/basic/updateProps/a');
  });

  it('测试updateProps function', done => {
    window.jestMock = jest.fn();
    mountStart(() => {
      expect(window.jestMock).toHaveBeenCalledTimes(2);
      done();
    });
    require('@/fixtures/basic/updateProps/b');
  });
});
