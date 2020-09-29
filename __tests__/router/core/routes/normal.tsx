import { createDOM, mountStart } from '../../../utils';

process.env.RUN_ENV = 'web';
window.scrollTo = jest.fn();

export default () => {
  describe('常规通用测试', () => {
    beforeEach(() => {
      window.__INITIAL_STATE__ = {
        award: {}
      };
      window.__AWARD__INIT__ROUTES__ = [];
      jest.restoreAllMocks();
      jest.resetAllMocks();
      jest.resetModules();
      history.replaceState({}, '', '/');
      createDOM();
      process.env.USE_ROUTE = '1';
    });

    it('错误测试', (done) => {
      process.env.USE_ROUTE = '0';
      mountStart(async (wrapper) => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        wrapper.update();
        expect(wrapper.html()).toBe('<p>hello error</p>');
        done();
      });
      require('@/fixtures/basic-router/a');
    });

    it('正确的路由切换 - 测试', (done) => {
      // 需要解析RouterSwitch
      window.__INITIAL_STATE__ = {
        award: {}
      };
      const home = (callback: Function) => {
        callback(require('@/fixtures/basic-router/a/pages/home'));
      };
      window.__AWARD__INIT__ROUTES__ = [
        {
          path: '/home',
          component: home
        }
      ];
      mountStart(async (wrapper) => {
        const { history } = require('award-router');
        await new Promise((resolve) => setTimeout(resolve, 10));
        wrapper.update();
        expect(wrapper.html()).toBe('<p>hello routes</p>');

        history.push({ pathname: '/home' });
        await new Promise((resolve) => setTimeout(resolve, 20));
        wrapper.update();
        expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home</p></div>');

        done();
      });
      require('@/fixtures/basic-router/a');
    });
  });
};
