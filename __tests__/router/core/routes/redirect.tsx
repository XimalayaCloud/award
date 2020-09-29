/**
 * 针对生命周期进行测试
 */
import { mountStart } from '../../../utils';

export default () => {
  it('重定向逻辑', (done) => {
    // 需要解析RouterSwitch
    window.__INITIAL_STATE__ = {
      award: {}
    };
    const home = (callback: Function) => {
      callback(require('@/fixtures/basic-router/b/pages/home'));
    };
    const about = (callback: Function) => {
      callback(require('@/fixtures/basic-router/b/pages/about'));
    };
    window.__AWARD__INIT__ROUTES__ = [
      {
        path: '/test1',
        redirect: '/about/1',
        exact: true
      },
      {
        path: '/test2',
        redirect: () => {
          return '/about/13?id=14';
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
    window.jestMock = jest.fn();
    mountStart(async (wrapper) => {
      const { history } = require('award-router');
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home</p></div>');
      expect(window.jestMock).toHaveBeenCalledTimes(1);

      history.push({ pathname: '/test1' });
      await new Promise((resolve) => setTimeout(resolve, 20));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about1</p></div>');
      expect(window.jestMock).toHaveBeenCalledTimes(5);

      history.push({ pathname: '/test2' });
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about1314</p></div>');
      expect(window.jestMock).toHaveBeenCalledTimes(9);

      done();
    });
    require('@/fixtures/basic-router/b');
  });
};
