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
    delete window.__AWARD__INIT__ROUTES__;
    window.__INITIAL_STATE__ = {};
  });
  it('router chain', done => {
    const about = (callback: Function) => {
      callback(require('@/fixtures/basic-router/routeUpdateProps/routes/c/pages/about'));
    };
    const aboutDetail = (callback: Function) => {
      callback(require('@/fixtures/basic-router/routeUpdateProps/routes/c/pages/about-detail'));
    };
    window.__AWARD__INIT__ROUTES__ = [
      {
        path: '/about',
        component: about,
        chain: true,
        routes: [
          {
            path: '/about/:id',
            component: aboutDetail,
            chain: true
          }
        ]
      }
    ];

    window.jestMock = jest.fn();
    (window as any).jestRouterMock = jest.fn();
    mountStart(async wrapper => {
      const { history } = require('award-router');
      history.push('/about/12');
      await new Promise(resolve => setTimeout(resolve, 40));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>about</p><p>about-detail-12</p>');

      history.push('/about/13');
      await new Promise(resolve => setTimeout(resolve, 40));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>about</p><p>about-detail-13</p>');

      expect((window as any).jestRouterMock).toHaveBeenCalledTimes(4);
      done();
    });
    require('@/fixtures/basic-router/routeUpdateProps/main/a');
  });
});
