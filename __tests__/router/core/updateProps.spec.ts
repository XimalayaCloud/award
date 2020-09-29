/**
 * 测试updateProps和reloadInitialProps
 */
import { mountStart, createDOM } from '../../utils';

window.scrollTo = jest.fn();

describe('updateProps 和 reloadInitialProps测试', () => {
  beforeEach(() => {
    delete window.jestMock;
    jest.resetAllMocks();
    jest.resetModules();
    history.replaceState({}, '', '/');
    createDOM();
    process.env.USE_ROUTE = '1';
    process.env.NODE_ENV = 'production';
    const home = (callback: Function) => {
      callback(require('@/fixtures/basic-router/updateProps/pages/home'));
    };
    const about = (callback: Function) => {
      callback(require('@/fixtures/basic-router/updateProps/pages/about'));
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
    if (document.getElementById('__URL__')) {
      (document.getElementById('__URL__') as any).remove();
    }
  });

  it('updateProps boolean true', (done) => {
    // 直接渲染home组件
    window.jestMock = jest.fn();
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      await new Promise((resolve) => setTimeout(resolve, 30));
      expect(window.jestMock).toHaveBeenCalledTimes(2);
      done();
    });
    require('@/fixtures/basic-router/updateProps/main/a');
  });

  it('updateProps function true', (done) => {
    // 直接渲染home组件
    window.jestMock = jest.fn();
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      await new Promise((resolve) => setTimeout(resolve, 30));
      expect(window.jestMock).toHaveBeenCalledTimes(3);
      done();
    });
    require('@/fixtures/basic-router/updateProps/main/b');
  });

  it('updateProps function false', (done) => {
    // 直接渲染home组件
    window.jestMock = jest.fn();
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      await new Promise((resolve) => setTimeout(resolve, 30));
      expect(window.jestMock).toHaveBeenCalledTimes(2);
      done();
    });
    require('@/fixtures/basic-router/updateProps/main/c');
  });

  it('updateProps function Error', (done) => {
    window.jestMock = jest.fn();
    history.replaceState({}, '', '/?id=123');
    mountStart(async (wrapper) => {
      expect(wrapper.html()).toBe('<p>hello </p><p>hello error</p>');
      expect(window.jestMock).toHaveBeenCalledTimes(1);
      done();
    });
    require('@/fixtures/basic-router/updateProps/main/b');
  });
});
