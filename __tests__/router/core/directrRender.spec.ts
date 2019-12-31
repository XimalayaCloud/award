import { mountStart, createDOM } from '../../utils';

describe('直接渲染路由组件', () => {
  beforeEach(() => {
    delete window.jestMock;
    jest.resetAllMocks();
    jest.resetModules();
    history.replaceState({}, '', '/');
    createDOM();
    process.env.USE_ROUTE = '1';
    process.env.NODE_ENV = 'production';
    const home = (callback: Function) => {
      callback(require('@/fixtures/basic-router/c/pages/home'));
    };
    const about = (callback: Function) => {
      callback(require('@/fixtures/basic-router/c/pages/about'));
    };
    window.__AWARD__INIT__ROUTES__ = [
      {
        path: '/test1',
        redirect: '/home',
        exact: true
      },
      {
        path: '/test2',
        redirect: () => {
          return '/about/1';
        },
        exact: true
      },
      {
        path: '/home',
        component: home,
        exact: true
      },
      {
        path: '/about/:id',
        component: about,
        client: true
      }
    ];
    window.__INITIAL_STATE__ = {};
  });

  it('直接渲染home路由组件', done => {
    // 直接渲染home组件
    history.replaceState({}, '', '/home');
    mountStart(async wrapper => {
      const { history } = require('award-router');
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home</p></div>');

      history.push({ pathname: '/about/1' });
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about</p></div>');
      done();
    });
    require('@/fixtures/basic-router/c');
  });

  it('直接渲染redirect组件', done => {
    // 直接渲染home组件
    history.replaceState({}, '', '/test1');
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('');
      done();
    });
    require('@/fixtures/basic-router/c');
  });
});
