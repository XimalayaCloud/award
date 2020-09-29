/**
 * 测试404相关错误
 */
import { mountStart, createDOM } from '../../utils';

window.scrollTo = jest.fn();

describe('404错误测试', () => {
  beforeEach(() => {
    delete window.jestMock;
    jest.resetAllMocks();
    jest.resetModules();
    history.replaceState({}, '', '/');
    createDOM();
    process.env.USE_ROUTE = '1';
    process.env.NODE_ENV = 'production';
    const home = (callback: Function) => {
      callback(require('@/fixtures/basic-router/common/pages/home'));
    };
    const about = (callback: Function) => {
      callback(require('@/fixtures/basic-router/common/pages/about'));
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

  it('常规路由切换测试', (done) => {
    // 直接渲染home组件
    window.jestMock = jest.fn();
    mountStart(async (wrapper) => {
      const { history } = require('award-router');
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      // 404
      history.push('/detail');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello error</p>');

      // home
      history.push('/home');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home</p></div>');

      // 跳转重复路由
      history.push('/home');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home</p></div>');
      done();
    });
    require('@/fixtures/basic-router/common/main/a');
  });

  it('开发环境切换同一个路由', (done) => {
    // 直接渲染home组件
    process.env.NODE_ENV = 'development';
    window.award_hmr_error = { status: 404 };
    // 直接渲染home组件
    window.jestMock = jest.fn();
    mountStart(async (wrapper) => {
      const { history } = require('award-router');
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      // 404
      history.push('/detail');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello error</p>');

      // home
      history.push('/home');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home</p></div>');

      // 跳转重复路由
      history.push('/home');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home</p></div>');
      done();
    });
    require('@/fixtures/basic-router/common/main/a');
  });

  it('直接渲染404', (done) => {
    // 直接渲染home组件
    history.replaceState({}, '', '/detail');
    window.jestMock = jest.fn();
    mountStart(async (wrapper) => {
      // const { history } = require('award-router');
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello error</p>');
      done();
    });
    require('@/fixtures/basic-router/common/main/a');
  });

  it('开发环境 + 热更新', (done) => {
    // 直接渲染home组件
    process.env.NODE_ENV = 'development';
    window.award_hmr = true;
    history.replaceState({}, '', '/detail');
    window.jestMock = jest.fn();
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello error</p>');
      done();
    });
    require('@/fixtures/basic-router/common/main/a');
  });

  it('测试404路由定义 <Route />', (done) => {
    // 直接渲染home组件
    window.__AWARD__INIT__ROUTES__ = [...window.__AWARD__INIT__ROUTES__, {}];
    history.replaceState({}, '', '/detail');
    window.jestMock = jest.fn();
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><p>hello error</p>');
      done();
    });
    require('@/fixtures/basic-router/common/main/b');
  });

  it('测试first routerWillUpdate false', (done) => {
    // 直接渲染home组件
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('');
      done();
    });
    require('@/fixtures/basic-router/common/main/c');
  });

  it('测试app fetch throw error', (done) => {
    // 直接渲染home组件
    history.replaceState({}, '', '/?id=1');
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('');
      done();
    });
    require('@/fixtures/basic-router/common/main/c');
  });

  it('测试redirect error', (done) => {
    // 直接渲染home组件
    window.__AWARD__INIT__ROUTES__ = [
      ...window.__AWARD__INIT__ROUTES__,
      {
        path: '/',
        redirect: () => {
          throw { message: 'error_test' };
        },
        exact: true
      }
    ];
    const error = jest.spyOn(console, 'error');
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>网站奔溃了，请联系网站管理员</p>');
      expect(error).toHaveBeenCalledWith(`客户端初始化代码出错`, { message: 'error_test' });
      done();
    });
    require('@/fixtures/basic-router/common/main/c');
  });

  it('测试切换到404', (done) => {
    // 直接渲染home组件
    window.__AWARD__INIT__ROUTES__ = [...window.__AWARD__INIT__ROUTES__, {}];
    window.history.replaceState({}, '', '/about/1');
    mountStart(async (wrapper) => {
      const { history } = require('award-router');
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(wrapper.html()).toBe(`<p>hello routes</p><div><p>hello about</p></div>`);

      history.replace({ pathname: '/about/2' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe(`<p>hello routes</p><div><p>hello about</p></div>`);

      history.push('/detail');
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe(`<p>hello routes</p><p>hello error</p>`);
      done();
    });
    require('@/fixtures/basic-router/common/main/e');
  });
});
