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

  it('reloadInitialProps 测试', (done) => {
    // 直接渲染home组件
    window.jestMock = jest.fn();
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(wrapper.html()).toBe('<p>hello routes</p>');

      const warnd = jest.spyOn(console, 'warn');
      wrapper.find('p').at(0).simulate('click');
      wrapper.find('p').at(0).simulate('click');
      await new Promise((resolve) => setTimeout(resolve, 30));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello routes</p>');
      expect(warnd).toHaveBeenCalledWith(
        '当前根组件正在执行reloadInitialProps函数，请等待执行完毕！'
      );
      done();
    });
    require('@/fixtures/basic-router/updateProps/main/b');
  });

  it('reloadInitialProps 测试', (done) => {
    // 直接渲染home组件
    window.jestMock = jest.fn();
    history.replaceState({}, '', '/?id=abc');
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe('<p>hello error</p>');
      done();
    });
    require('@/fixtures/basic-router/updateProps/main/b');
  });
});
