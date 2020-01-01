/**
 * 测试fetch，即配合getInitialProps函数进行测试
 */
import { createServer, Server } from '../utils/server';
import * as os from 'os';

let server: Server;

const isWin = os.type() === 'Windows_NT';
describe('测试award-fetch  node', () => {
  beforeEach(done => {
    const root = require
      .resolve('@/fixtures/with-data/a/server.js')
      .replace(isWin ? /\\server\.js$/ : /\/server\.js$/, '');
    process.chdir(root);
    process.env.RUN_ENV = 'node';
    process.env.NODE_ENV = 'development';
    jest.resetModules();
    server = createServer(done);
  });

  afterEach(done => {
    if (server.close) {
      server.close(done);
    }
  });

  it('刷新APIGateway', async () => {
    const fetch = require('award-fetch').default;

    server.use(async ctx => {
      ctx.body = 'hello world';
    });

    await new Promise(resolve => {
      fetch('//example.com/api/list', {
        method: 'POST',
        dataType: 'text'
      }).catch((error: any) => {
        expect(error.message).toBe(`Node端发起http请求时，请指定协议`);
        resolve();
      });
    });
  });

  it('测试配置了 fetchConfig', async () => {
    const fetch = require('award-fetch').default;
    if (server.close) {
      server.close();
    }
    await new Promise(resolve => {
      server = createServer(resolve, { port: 10909 });
    });

    server.use(async ctx => {
      ctx.body = 'hello world';
    });

    await new Promise(resolve => {
      fetch('/api/list', {
        method: 'POST',
        dataType: 'text'
      }).then((data: any) => {
        expect(data).toBe(`hello world`);
        resolve();
      });
    });

    await new Promise(resolve => {
      fetch('/api/detail', {
        method: 'POST',
        dataType: 'text'
      }).then((data: any) => {
        expect(data).toBe(`hello world`);
        resolve();
      });
    });

    await new Promise(resolve => {
      fetch('/api/music', {
        method: 'POST',
        dataType: 'text'
      }).catch((err: any) => {
        expect(err.message).toBe(
          `请求地址[/api/music]匹配的domain必须设置http协议，当前node请求的完整url为127.0.0.1:10909/api/music`
        );
        resolve();
      });
    });
  });

  it('测试配置 fetchConfig的domainMap未找到', async () => {
    const root = require
      .resolve('@/fixtures/basic/examples/a/index.tsx')
      .replace(isWin ? /\\index\.tsx$/ : /\/index\.tsx$/, '');
    process.chdir(root);
    const fetch = require('award-fetch').default;
    if (server.close) {
      server.close();
    }
    await new Promise(resolve => {
      server = createServer(resolve, { port: 10909 });
    });

    server.use(async ctx => {
      ctx.body = 'hello world';
    });

    await new Promise(resolve => {
      fetch('/api/list', {
        method: 'POST',
        dataType: 'text'
      }).catch((err: any) => {
        expect(err.message).toBe(`Node端发起请求[/api/list]，没有找到对应的domainMap`);
        resolve();
      });
    });
  });

  it('测试未配置 fetchConfig的domainMap', async () => {
    const root = require
      .resolve('@/fixtures/basic/examples/b/index.tsx')
      .replace(isWin ? /\\index\.tsx$/ : /\/index\.tsx$/, '');
    process.chdir(root);
    const fetch = require('award-fetch').default;
    if (server.close) {
      server.close();
    }
    await new Promise(resolve => {
      server = createServer(resolve, { port: 10909 });
    });

    server.use(async ctx => {
      ctx.body = 'hello world';
    });

    await new Promise(resolve => {
      fetch('/api/list', {
        method: 'POST',
        dataType: 'text'
      }).catch((err: any) => {
        expect(err.message).toBe(`Node端发起http请求时，请确保配置了domainMap`);
        resolve();
      });
    });
  });

  it('错误尝试', async () => {
    const fetch = require('award-fetch').default;
    const retry = jest.fn();
    server.use(async ctx => {
      retry();
      ctx.status = 500;
      ctx.body = 'hello world';
    });

    await new Promise(resolve => {
      fetch(server.url, {
        method: 'POST',
        dataType: 'text'
      }).catch((err: any) => {
        expect(err.message).toBe(`${server.url}: Internal Server Error`);
        expect(retry).toHaveBeenCalledTimes(3);
        resolve();
      });
    });
  });
});
