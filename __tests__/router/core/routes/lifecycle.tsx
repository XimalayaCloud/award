/**
 * 针对生命周期进行测试
 */
import { mountStart } from '../../../utils';

export default () => {
  it('常规测试路由生命周期', (done) => {
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
    (window as any).routeDidUpdateArgs = jest.fn();
    mountStart(async (wrapper) => {
      const { history } = require('award-router');
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello home</p></div>');
      expect(window.jestMock).toHaveBeenCalledTimes(1);

      const warn = jest.spyOn(console, 'warn');
      history.push({ pathname: '/about' });
      await new Promise((resolve) => setTimeout(resolve, 50));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about1</p></div>');
      expect(window.jestMock).toHaveBeenCalledTimes(4);
      expect(warn).toBeCalledWith('/about/1');
      expect(warn).toBeCalledWith('');

      history.push({ pathname: '/about/13?id=14' });
      await new Promise((resolve) => setTimeout(resolve, 100));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p><div><p>hello about1314</p></div>');
      expect(window.jestMock).toHaveBeenCalledTimes(7);
      expect(warn).toBeCalledWith('/about/13');
      expect(warn).toBeCalledWith('?id=14');

      expect((window as any).routeDidUpdateArgs).toHaveBeenCalledTimes(2);
      done();
    });
    require('@/fixtures/basic-router/b');
  });
};
