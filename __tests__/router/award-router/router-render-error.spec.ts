/**
 * 测试路由渲染出错
 */
import { mountStart, createDOM } from '../../utils';

window.scrollTo = jest.fn();

describe('测试路由渲染出错', () => {
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
  });
  it('路由渲染错误测试', done => {
    history.replaceState({}, '', '/home');
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home1</p></div>');

      // 点击出错
      wrapper
        .find('p')
        .at(1)
        .simulate('click');
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello error</p>');
      done();
    });
    require('@/fixtures/basic-router/routeUpdateProps');
  });

  it('路由渲染错误测试 + loading Function error-main/a', done => {
    history.replaceState({}, '', '/home');
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home1</p></div>');

      // 点击出错
      wrapper
        .find('p')
        .at(1)
        .simulate('click');
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>loading...</p>');

      await new Promise(resolve => setTimeout(resolve, 500));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello errorgetInitialProps</p>');
      done();
    });
    require('@/fixtures/basic-router/routeUpdateProps/error-main/a');
  });

  it('路由渲染错误测试 + loading Element error-main/b', done => {
    history.replaceState({}, '', '/home');
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home1</p></div>');

      // 点击出错
      wrapper
        .find('p')
        .at(1)
        .simulate('click');
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>loading...element</p>');

      await new Promise(resolve => setTimeout(resolve, 500));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello errorgetInitialProps</p>');
      done();
    });
    require('@/fixtures/basic-router/routeUpdateProps/error-main/b');
  });

  it('路由渲染错误测试 + loading other error-main/c', done => {
    history.replaceState({}, '', '/home');
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home1</p></div>');

      // 点击出错
      wrapper
        .find('p')
        .at(1)
        .simulate('click');
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      await new Promise(resolve => setTimeout(resolve, 500));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello errorgetInitialProps</p>');
      done();
    });
    require('@/fixtures/basic-router/routeUpdateProps/error-main/c');
  });

  it('路由渲染错误测试 + loading Element error-main/d', done => {
    history.replaceState({}, '', '/home');
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home1</p></div>');

      // 点击出错
      wrapper
        .find('p')
        .at(1)
        .simulate('click');
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>loading...routerError</p>');

      await new Promise(resolve => setTimeout(resolve, 500));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello errorgetInitialProps</p>');
      done();
    });
    require('@/fixtures/basic-router/routeUpdateProps/error-main/d');
  });
});
