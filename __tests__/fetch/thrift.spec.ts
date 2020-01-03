/**
 * 测试一些配置文件
 */
import { createServer, Server } from '../utils/server';
import * as os from 'os';

let server: Server;

const isWin = os.type() === 'Windows_NT';

describe('测试thrift', () => {
  beforeEach(done => {
    const root = require
      .resolve('@/fixtures/with-data/c/index.tsx')
      .replace(isWin ? /\\index\.tsx$/ : /\/index\.tsx$/, '');
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

  it('测试thrift，但是配置没有指定', async () => {
    const root = require
      .resolve('@/fixtures/basic/examples/a/index.tsx')
      .replace(isWin ? /\\index\.tsx$/ : /\/index\.tsx$/, '');
    process.chdir(root);
    const fetch = require('award-fetch').default;

    server.use(async ctx => {
      ctx.body = 'hello world';
    });

    await new Promise(resolve => {
      fetch(server.url, {
        thrift: true,
        method: 'POST',
        dataType: 'text'
      }).then((data: any) => {
        expect(data).toBe(`hello world`);
        resolve();
      });
    });
  });

  it('测试thrift，但是配置没有指定', async () => {
    const fetch = require('award-fetch').default;

    server.use(async ctx => {
      ctx.body = 'hello world';
    });

    await new Promise(resolve => {
      fetch(server.url, {
        thrift: true,
        method: 'POST',
        dataType: 'text'
      }).then((data: any) => {
        expect(data).toBe(`hello world`);
        resolve();
      });
    });
  });
});
