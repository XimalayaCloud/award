import { mountStart } from '../../../utils';

export default () => {
  it('测试单页应用', (done) => {
    const home = (callback: Function) => {
      callback(require('@/fixtures/basic-router/c/pages/home'));
    };
    const about = (callback: Function) => {
      callback(require('@/fixtures/basic-router/c/pages/about'));
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
    process.env.WEB_TYPE = 'WEB_SPA';
    process.env.EXPORTPATH = JSON.stringify({
      'about.html': '/about/1'
    });
    mountStart(async (wrapper) => {
      const url = 'about.html#/about/1';
      Object.defineProperty(window, 'location', {
        value: {
          href: ''
        }
      });
      const { history } = require('award-router');
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      history.push({ pathname: '/about/1' });
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(window.location.href).toEqual(url);
      done();
    });
    require('@/fixtures/basic-router/c');
  });
};
