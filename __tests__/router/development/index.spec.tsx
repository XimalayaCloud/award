/**
 * 测试有路由的单页应用
 */
import { mountStart, createDOM } from '../../utils';

describe('路由测试 - 开发环境', () => {
  beforeEach(() => {
    process.env.NODE_ENV = 'development';
    process.env.WEB_TYPE = 'WEB_SSR';
    delete window.jestMock;
    jest.resetAllMocks();
    jest.resetModules();
    history.replaceState({}, '', '/');
    createDOM();
    process.env.USE_ROUTE = '0';
    const home = (callback: Function) => {
      callback(require('@/fixtures/basic-router/c/pages/home'));
    };
    const about = (callback: Function) => {
      callback(require('@/fixtures/basic-router/c/pages/about'));
    };
    window.__AWARD__INIT__ROUTES__ = [
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

  it('测试热更新', (done) => {
    mountStart((wrapper) => {
      expect(wrapper.html()).toBe('<p>hello routes</p>');
      done();
    });
    require('@/fixtures/basic-router/c');
  });
});
