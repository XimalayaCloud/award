/**
 * 针对award-router库的功能进行协调测试
 */
import { mountStart, createDOM } from '../../utils';

window.scrollTo = jest.fn();

describe('award-router', () => {
  beforeEach(() => {
    delete window.jestMock;
    jest.resetAllMocks();
    jest.resetModules();
    history.replaceState({}, '', '/');
    createDOM();
    process.env.USE_ROUTE = '1';
    process.env.NODE_ENV = 'production';
    const home = (callback: Function) => {
      callback(require('@/fixtures/basic-router/routeUpdateProps/routes/b/pages/home'));
    };
    const about = (callback: Function) => {
      callback(require('@/fixtures/basic-router/routeUpdateProps/routes/b/pages/about'));
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
      }
    ];
    window.__INITIAL_STATE__ = {};
    const __URL__ = document.getElementById('__URL__');
    if (__URL__) {
      __URL__.remove();
    }
  });

  it('测试路由props reloadInitialProps', done => {
    (window as any).jestRouterMock = jest.fn();
    history.replaceState({}, '', '/about/1');
    mountStart(async wrapper => {
      const { history } = require('award-router');
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe(
        '<p>hello routes</p><p>reloadInitialProps这是系统关键字，请不要使用该名称作为key</p>'
      );

      // 切换正常
      history.push('/about/2');
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello about</p>');

      // 点击触发reloadInitialProps
      const warn = jest.spyOn(console, 'warn');
      wrapper
        .find('p')
        .at(1)
        .simulate('click');
      wrapper
        .find('p')
        .at(1)
        .simulate('click');
      expect(warn).toHaveBeenCalledWith(
        '当前路由组件正在执行reloadInitialProps函数，请等待执行完毕！'
      );
      await new Promise(resolve => setTimeout(resolve, 20));
      expect((window as any).jestRouterMock).toHaveBeenCalledTimes(5);
      done();
    });
    require('@/fixtures/basic-router/routeUpdateProps/main/b');
  });

  it('测试路由props updateProps', done => {
    (window as any).jestRouterMock = jest.fn();
    history.replaceState({}, '', '/about/2');
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello about</p>');
      done();
    });
    require('@/fixtures/basic-router/routeUpdateProps/main/b');
  });

  it('测试路由props updateProps false ssr', done => {
    (window as any).jestRouterMock = jest.fn();
    const URL = document.createElement('div');
    URL.id = '__URL__';
    URL.setAttribute('data-loadable', '1');
    document.body.appendChild(URL);
    history.replaceState({}, '', '/about/2');
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello about</p>');
      done();
    });
    require('@/fixtures/basic-router/routeUpdateProps/main/b');
  });

  it('测试路由props updateProps true ssr', done => {
    (window as any).jestRouterMock = jest.fn();
    const URL = document.createElement('div');
    URL.id = '__URL__';
    URL.setAttribute('data-loadable', '1');
    document.body.appendChild(URL);
    history.replaceState({}, '', '/about/3');
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello about</p>');
      done();
    });
    require('@/fixtures/basic-router/routeUpdateProps/main/b');
  });
});
