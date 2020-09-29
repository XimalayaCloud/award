/**
 * 测试路由切换数据加载出错
 */
import { mountStart, createDOM } from '../../utils';

describe('路由错误测试', () => {
  beforeEach(() => {
    delete window.jestMock;
    jest.resetAllMocks();
    jest.resetModules();
    history.replaceState({}, '', '/');
    createDOM();
    process.env.USE_ROUTE = '1';
    process.env.NODE_ENV = 'production';
    const home = (callback: Function) => {
      callback(require('@/fixtures/basic-router/error-test/pages/home'));
    };
    const about = (callback: Function) => {
      callback(require('@/fixtures/basic-router/error-test/pages/about'));
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

  it('路由切换数据加载出错', (done) => {
    // 直接渲染home组件

    mountStart(async (wrapper) => {
      const { history } = require('award-router');
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      window.scrollTo = jest.fn();
      history.push({
        pathname: '/about/1?id=1',
        data: {
          scroll: true,
          x: 1,
          y: 100
        }
      });
      await new Promise((resolve) => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello error</p>');
      expect(window.scrollTo).toHaveBeenCalledWith(1, 100);

      delete window.scrollTo;
      window.scrollTo = jest.fn();
      history.push({
        pathname: '/about/2',
        data: {
          scroll: false
        }
      });
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(window.scrollTo).toBeCalledTimes(0);

      delete window.scrollTo;
      window.scrollTo = jest.fn();
      history.push({
        pathname: '/about/2',
        data: {
          scroll: '',
          x: 1,
          y: 1
        }
      });
      await new Promise((resolve) => setTimeout(resolve, 20));
      expect(window.scrollTo).toBeCalledTimes(0);
      done();
    });
    require('@/fixtures/basic-router/error-test');
  });
});
