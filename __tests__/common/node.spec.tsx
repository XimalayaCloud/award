/**
 * 通用测试
 * 插件、热更新、setAward等
 */

describe('开发环境', () => {
  beforeAll(() => {
    process.env.NODE_ENV = 'development';
    process.env.RUN_ENV = 'node';
  });

  beforeEach(() => {
    jest.resetModules();
    global.__AWARD__PLUGINS__ = {};
  });

  it('服务端 插件引用测试', () => {
    const info = jest.fn();
    global.__AWARD__PLUGINS__ = {
      'award-plugin-demo': {
        name: 'demo',
        default: {
          start() {
            info();
          }
        }
      },
      'award-plugin-demo-test': {
        name: 'demoTest',
        default: {
          start() {
            info();
          }
        }
      }
    };
    const award = jest.requireActual('award');
    award.demo.start();
    award.demoTest.start();
    expect(info).toBeCalledTimes(2);
  });

  it('服务端 插件错误引用', () => {
    const info = jest.fn();
    global.__AWARD__PLUGINS__ = {
      'award-plugin-demo': {
        name: 'demo'
      },
      'award-plugin-demo-test': {
        name: 'demoTest'
      }
    };
    jest.requireActual('award');
    expect(info).toBeCalledTimes(0);
  });

  it('node环境运行setAward & removeAward', done => {
    const warn = jest.spyOn(console, 'warn');
    global.AppRegistry = () => {
      expect(warn).toHaveBeenCalledWith('setAward方法在服务端不生效');
      expect(warn).toHaveBeenCalledWith('removeAward方法在服务端不生效');
      done();
    };

    require('@/fixtures/basic/setAward/first');
  });
});
