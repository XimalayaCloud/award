/* eslint-disable max-nested-callbacks */
/**
 * 测试Award项目的开发启动服务
 */
import * as Koa from 'koa';
import * as os from 'os';
const isWin = os.type() === 'Windows_NT';

describe('测试Award项目的生产环境启动', () => {
  it('常规测试 - 生产环境启动', (done) => {
    const root = require
      .resolve('@/fixtures/with-data/b/index.js')
      .replace(isWin ? /\\index\.js$/ : /\/index\.js$/, '');
    process.chdir(root);
    process.argv[2] = 'start';
    const Server = require('award/server');
    const app = new Server();
    let listen: any = null;

    app.use(async (ctx: Koa.Context, next: Koa.Next) => {
      if (ctx.path === '/api/list') {
        ctx.body = { name: 'hello world' };
        return;
      }
      await next();
    });

    app.core();

    app.listen(11909, (mylisten: any) => {
      listen = mylisten;
      // 访问渲染的页面
      const fetch = require('award-fetch').default;
      process.env.RUN_ENV = 'node';
      fetch('http://127.0.0.1:11909/api/list').then((data: any) => {
        expect(data.name).toBe(`hello world`);
        listen.close(done);
      });
    });
  });
});
