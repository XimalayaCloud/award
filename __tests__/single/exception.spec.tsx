/**
 * 测试无路由的单页应用
 */
import { mountStart, createDOM } from '../utils';

describe('测试客户端执行start函数 - 生产环境', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'production';
    process.env.RUN_ENV = 'web';
  });

  beforeEach(() => {
    window.__INITIAL_STATE__ = {
      award: {}
    };
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.resetModules();
    history.replaceState({}, '', '/');
    createDOM();
  });

  it('直接渲染出错页面', (done) => {
    window.__INITIAL_STATE__ = {
      award: {},
      AwardException: {
        message: '出错了'
      }
    };
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe(`<p>出错了</p>`);
      done();
    });
    require('@/fixtures/basic/examples/b');
  });

  it('异步渲染出错', (done) => {
    mountStart(async (wrapper) => {
      wrapper.find('h1').at(0).simulate('click');
      expect(wrapper.html()).toBe(`<p>loading...</p>`);
      await new Promise((resolve) => setTimeout(resolve, 200));
      wrapper.update();
      expect(wrapper.html()).toBe(`<p>hello error</p>`);
      done();
    });
    require('@/fixtures/basic/examples/c');
  });

  it('getInitialProps执行出错', (done) => {
    mountStart(async (wrapper) => {
      history.replaceState({}, 'About', '/about?id=1');
      wrapper.find('h1').at(0).simulate('click');
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe(`<p>hello error</p>`);
      done();
    });
    require('@/fixtures/basic/examples/d');
  });

  it('渲染出错 ctx.loading Function', (done) => {
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe(`<p>hello error</p>`);
      done();
    });
    require('@/fixtures/basic/examples/e');
  });

  it('渲染出错 ctx.loading str', (done) => {
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      wrapper.update();
      expect(wrapper.html()).toBe(`<p>hello error</p>`);
      done();
    });
    require('@/fixtures/basic/examples/f');
  });
});

describe('测试客户端执行start函数 - 开发环境', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'development';
    process.env.RUN_ENV = 'web';
  });

  beforeEach(() => {
    window.__INITIAL_STATE__ = {
      award: {}
    };
    jest.resetModules();
    history.replaceState({}, '', '/');
    createDOM();
  });

  it('常规测试 - 开发环境', (done) => {
    // 开发环境会通过babel重新构造start函数，这里需要引入babel解析
    mountStart(async (wrapper) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      wrapper.update();
      expect(wrapper.html()).toBe(`<p>hello error</p>`);
      done();
    });
    require('@/fixtures/basic/examples/f');
  });

  it('常规测试 - 热更新', (done) => {
    // 开发环境会通过babel重新构造start函数，这里需要引入babel解析
    window.award_hmr = true;
    window.award_hmr_error = {
      data: {
        name: 'hello hmr error'
      }
    };
    mountStart((wrapper) => {
      setTimeout(() => {
        wrapper.update();
        expect(wrapper.html()).toBe(`<p>hello hmr error</p>`);
        done();
      }, 0);
    });
    require('@/fixtures/basic/examples/d');
  });
});
