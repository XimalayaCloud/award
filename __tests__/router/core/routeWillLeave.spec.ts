/**
 * 测试routeWillUpdate
 */
import { mountStart, createDOM } from '../../utils';

window.scrollTo = jest.fn();

describe('routeWillLeave测试', () => {
  beforeEach(() => {
    delete window.jestMock;
    jest.resetAllMocks();
    jest.resetModules();
    history.replaceState({}, '', '/');
    createDOM();
    process.env.USE_ROUTE = '1';
    process.env.NODE_ENV = 'production';
    const home = (callback: Function) => {
      callback(require('@/fixtures/basic-router/b/pages/home'));
    };
    const about = (callback: Function) => {
      callback(require('@/fixtures/basic-router/b/pages/about'));
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

  it('常规测试', (done) => {
    // 直接渲染home组件
    window.jestMock = jest.fn();
    mountStart(async (wrapper) => {
      const { history } = require('award-router');
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home</p></div>');

      // 切换到about开始测试routeWillLeave
      history.push('/about/1?id=1');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about11</p></div>');

      history.push('/about/1?id=2');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe(
        '<em>同意</em><em>拒绝</em><p>hello routes</p><div><p>hello about11</p></div>'
      );

      // 点击拒绝
      wrapper.find('em').at(1).simulate('click');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about11</p></div>');

      // 点击同意
      history.push('/about/1?id=2');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      wrapper.find('em').at(0).simulate('click');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about12</p></div>');

      // 测试warning，注意此时并没有跳转
      const warn = jest.spyOn(console, 'warn');
      process.env.NODE_ENV = 'development';
      history.push('/about/1?id=3');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(warn).toHaveBeenLastCalledWith(
        '[/about/:id][routeWillLeave] next函数接收的不是react组件！！！'
      );
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about12</p></div>');

      // 测试next('/about/4') 2 => 4
      history.push('/about/1?id=4');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about4</p></div>');

      // /about/4 => /about/1?id=4
      history.push('/about/1?id=4');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about14</p></div>');

      // /about/1?id=4 => /about/1?id=5 禁用跳转测试
      history.push('/about/1?id=5');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about14</p></div>');

      // 测试跳转object
      history.push('/about/1?id=6');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about6</p></div>');

      history.push('/about/1?id=7');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about1</p></div>');

      const warnd = jest.spyOn(console, 'warn');
      history.push('/about/1?id=8&pid=100');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about1</p></div>');
      expect(warnd).toHaveBeenCalledWith('next函数接收的类型不正确');

      // 浏览器回退
      console.log(444447777);
      window.history.back();
      window.history.back();
      await new Promise((resolve) => setTimeout(resolve, 30));
      done();
    });
    require('@/fixtures/basic-router/b');
  });

  it('routerWillUpdate 切换', (done) => {
    const warn = jest.spyOn(console, 'warn');
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('');
      expect(warn).toHaveBeenCalledWith('next函数接收的类型不正确');
      done();
    });
    require('@/fixtures/basic-router/common/main/d');
  });

  it('routeWillLeave 浏览器回退前进', (done) => {
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
    mountStart(async (wrapper) => {
      const { history } = require('award-router');
      history.push('/about/1');
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about</p></div>');

      history.push('/about/2');
      await new Promise((resolve) => setTimeout(resolve, 20));
      wrapper.update();

      history.push('/about/3');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();

      const warn = jest.spyOn(console, 'warn');
      window.history.back();
      await new Promise((resolve) => setTimeout(resolve, 40));
      expect(warn).toHaveBeenCalledWith('back');

      const warnd = jest.spyOn(console, 'warn');
      window.history.back();
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(warnd).toHaveBeenCalledWith('stop');
      done();
    });
    require('@/fixtures/basic-router/common/main/e');
  });
});
