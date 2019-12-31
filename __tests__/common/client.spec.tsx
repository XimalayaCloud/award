/**
 * 通用测试
 * 插件、热更新、setAward等
 */
import { createDOM, removeDOM, mountStart } from '../utils';

describe('通用状态测试', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'development';
    process.env.RUN_ENV = 'web';
    createDOM();
  });

  beforeEach(() => {
    window.__INITIAL_STATE__ = {
      award: {}
    };
    jest.dontMock('award');
    jest.resetModules();
    history.replaceState({}, '', '/');
  });

  it('客户端 插件引用测试', done => {
    // 插件的注入是通过babel注入到start的第三个参数，所以我们需要hook award
    mountStart(wrapper => {
      setTimeout(() => {
        wrapper.update();
        expect(wrapper.html()).toBe(`<h1>hello world</h1>`);
        done();
      }, 0);
    });
    jest.doMock('award', () => ({
      start(Component: any, ErrorComponent: any) {
        const plugins = { plugins: ['award-plugin-demo'] };
        jest.requireActual('award').start(Component, ErrorComponent, plugins)(() => null);
      },
      basename() {
        return jest.requireActual('award').basename();
      }
    }));
    require('@/fixtures/basic/examples/a');
  });

  it('测试不存在award选择器', () => {
    process.env.NODE_ENV = 'production';
    process.env.RUN_ENV = 'web';
    removeDOM();
    require('@/fixtures/basic/examples/a');
    const body: any = document.body;
    expect(body.innerHTML).toBe('不存在名称为【award】的id选择器');
    createDOM();
  });
});

describe('通用API测试', () => {
  beforeAll(() => {
    createDOM();
  });

  beforeEach(() => {
    window.__INITIAL_STATE__ = {
      award: {}
    };
    jest.dontMock('award');
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.resetModules();
    history.replaceState({}, '', '/');
    process.env.NODE_ENV = 'production';
    process.env.RUN_ENV = 'web';
  });

  it('测试setAward removeAward 正常', done => {
    window.__INITIAL_STATE__ = {
      award: {
        name: '',
        age: ''
      }
    };
    const warn = jest.spyOn(console, 'warn');
    mountStart(wrapper => {
      expect(warn).toHaveBeenCalledWith('setAward必须接受一个不为空的对象');
      expect(wrapper.html()).toEqual('<h1>hello </h1><p></p>');
      wrapper
        .find('h1')
        .at(0)
        .simulate('click');
      expect(wrapper.html()).toEqual('<h1>hello world</h1><p></p>');
      wrapper
        .find('p')
        .at(0)
        .simulate('click');
      expect(wrapper.html()).toEqual('<h1>hello </h1><p>20</p>');
      done();
    });
    require('@/fixtures/basic/setAward/first');
  });

  it('测试setAward removeAward error', done => {
    window.__INITIAL_STATE__ = {
      award: {
        name: '',
        age: ''
      }
    };
    const warn = jest.spyOn(console, 'warn');
    mountStart(wrapper => {
      expect(wrapper.html()).toEqual('<h1>hello </h1><p></p>');
      wrapper
        .find('h1')
        .at(0)
        .simulate('click');
      expect(warn).toHaveBeenCalledWith('setAward必须接受一个不为空的对象');
      wrapper
        .find('p')
        .at(0)
        .simulate('click');
      expect(wrapper.html()).toEqual('<h1>hello </h1><p>20</p>');
      expect(warn).toHaveBeenCalledWith('removeAward移除的【name】不存在');
      done();
    });
    require('@/fixtures/basic/setAward/error');
  });

  it('测试 Consumer shouldComponentUpdate', done => {
    window.__INITIAL_STATE__ = {
      award: {
        name: '',
        age: ''
      }
    };
    mountStart(wrapper => {
      expect(wrapper.html()).toEqual('<p>123</p><button>123</button>');
      wrapper
        .find('button')
        .at(0)
        .simulate('click');
      expect(wrapper.html()).toEqual('<p>123</p><button>abc</button>');
      done();
    });
    require('@/fixtures/basic/setAward/update');
  });
});

describe('测试使用__URL__', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'development';
    process.env.RUN_ENV = 'web';
  });

  beforeEach(() => {
    jest.restoreAllMocks();
    jest.resetAllMocks();
    jest.resetModules();
    jest.dontMock('award');
    createDOM();
    const __URL__ = document.getElementById('__URL__');
    if (__URL__) {
      __URL__.remove();
    }
  });

  it('未使用react-loadabel场景, hydrate', done => {
    process.env.NODE_ENV = 'production';
    const URL = document.createElement('div');
    const render = jest.fn();

    URL.id = '__URL__';
    URL.setAttribute('data-loadable', '0');
    document.body.appendChild(URL);
    // 模拟服务端渲染
    jest.doMock('react-dom', () => ({
      hydrate() {
        render();
        const { ssr } = require('award-utils/loadParams').get();
        expect(ssr).toBeTruthy();
        jest.requireActual('react-dom').hydrate(...arguments);
        expect(render).toHaveBeenCalledTimes(1);
        setTimeout(() => {
          expect((document.getElementById('award') as any).innerHTML).toBe('<h1>hello world</h1>');
          done();
        }, 100);
      }
    }));
    require('@/fixtures/basic/examples/a');
  });

  it('使用react-loadabel场景, render', done => {
    process.env.NODE_ENV = 'production';
    const URL = document.createElement('div');
    URL.id = '__URL__';
    URL.setAttribute('data-loadable', '1');
    document.body.appendChild(URL);
    const render = jest.fn();
    jest.mock('react-dom', () => ({
      render() {
        render();
        expect(render).toHaveBeenCalledTimes(1);
        done();
      }
    }));
    require('@/fixtures/basic/examples/a');
  });

  it('测试 开发环境', done => {
    process.env.NODE_ENV = 'development';
    const URL = document.createElement('div');
    URL.id = '__URL__';
    document.body.appendChild(URL);
    mountStart(wrapper => {
      expect(wrapper.html()).toBe('<h1>hello world</h1>');
      done();
    });
    require('@/fixtures/basic/examples/a');
  });

  it('测试 removeChild', done => {
    delete Element.prototype.remove;
    process.env.NODE_ENV = 'production';
    const URL = document.createElement('div');
    URL.id = '__URL__';
    URL.setAttribute('data-loadable', '1');
    document.body.appendChild(URL);
    const render = jest.fn();
    jest.mock('react-dom', () => ({
      render() {
        render();
        expect(render).toHaveBeenCalledTimes(1);
        done();
      }
    }));
    require('@/fixtures/basic/examples/a');
  });

  it('测试 removeChild parentNode = null', done => {
    delete Element.prototype.remove;
    Object.defineProperty(Element.prototype, 'parentNode', {
      configurable: true,
      enumerable: true,
      writable: true,
      value: null
    });
    process.env.NODE_ENV = 'production';
    const URL = document.createElement('div');
    URL.id = '__URL__';
    URL.setAttribute('data-loadable', '1');
    document.body.appendChild(URL);
    const render = jest.fn();
    jest.mock('react-dom', () => ({
      render() {
        render();
        expect(render).toHaveBeenCalledTimes(1);
        done();
      }
    }));
    require('@/fixtures/basic/examples/a');
  });
});
