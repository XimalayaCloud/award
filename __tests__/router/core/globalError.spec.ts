/**
 * 测试存在路由的情况下，发生全局错误
 */
import { mountStart, createDOM } from '../../utils';

describe('路由错误测试', () => {
  beforeEach(() => {
    delete window.jestMock;
    jest.resetAllMocks();
    jest.resetModules();
    history.replaceState({}, '', '/');
    createDOM();
    process.env.RUN_ENV = 'web';
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

  it('全局错误', done => {
    // 直接渲染home组件
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      wrapper
        .find('p')
        .at(0)
        .simulate('click');
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello error</p>');
      done();
    });
    require('@/fixtures/basic-router/error-test');
  });

  it('全局错误 + loading Function main/a', done => {
    // 直接渲染home组件
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      wrapper
        .find('p')
        .at(0)
        .simulate('click');
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>loading...</p>');

      await new Promise(resolve => setTimeout(resolve, 500));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello errorgetInitialProps</p>');
      done();
    });
    require('@/fixtures/basic-router/error-test/main/a');
  });

  it('全局错误 + loading Element main/b', done => {
    // 直接渲染home组件
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      wrapper
        .find('p')
        .at(0)
        .simulate('click');
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>loading...element</p>');

      await new Promise(resolve => setTimeout(resolve, 500));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello errorgetInitialProps</p>');
      done();
    });
    require('@/fixtures/basic-router/error-test/main/b');
  });

  it('全局错误 + loading other main/c', done => {
    // 直接渲染home组件
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      wrapper
        .find('p')
        .at(0)
        .simulate('click');
      await new Promise(resolve => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('');

      await new Promise(resolve => setTimeout(resolve, 500));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello errorgetInitialProps</p>');
      done();
    });
    require('@/fixtures/basic-router/error-test/main/c');
  });

  it('全局错误 + loading Element main/d', done => {
    history.replaceState({}, '', '/home');
    // 直接渲染home组件
    mountStart(async wrapper => {
      await new Promise(resolve => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home</p></div>');

      wrapper
        .find('p')
        .at(0)
        .simulate('click');
      await new Promise(resolve => setTimeout(resolve, 50));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>loading.../home</p>');

      await new Promise(resolve => setTimeout(resolve, 500));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello errorgetInitialProps</p>');
      done();
    });
    require('@/fixtures/basic-router/error-test/main/d');
  });
});
