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
  it('未babel后的代码测试', done => {
    window.jestMock = jest.fn();
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');
      done();
    });
    require('@/fixtures/basic-router/routeUpdateProps/main/a');
  });

  it('history go、goBack、goForward', done => {
    const home = (callback: Function) => {
      callback(require('@/fixtures/basic-router/routeUpdateProps/routes/a/pages/home'));
    };
    const about = (callback: Function) => {
      callback(require('@/fixtures/basic-router/routeUpdateProps/routes/a/pages/about'));
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

    window.jestMock = jest.fn();
    mountStart(async wrapper => {
      const { history } = require('award-router');
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      history.push('/about/12');
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about12</p></div>');

      history.push('/about/13');
      await new Promise(resolve => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about13</p></div>');

      // 测试goBack
      history.goBack();
      await new Promise(resolve => setTimeout(resolve, 40));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about12</p></div>');

      // 测试go
      history.go(1);
      await new Promise(resolve => setTimeout(resolve, 50));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about13</p></div>');

      // 测试go
      history.go(-2);
      await new Promise(resolve => setTimeout(resolve, 60));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      // goForward
      history.goForward();
      await new Promise(resolve => setTimeout(resolve, 70));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about12</p></div>');

      done();
    });
    require('@/fixtures/basic-router/routeUpdateProps/main/a');
  });
});
