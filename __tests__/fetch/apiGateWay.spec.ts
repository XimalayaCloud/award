/**
 * 测试fetch，即配合getInitialProps函数进行测试
 */
import { createServer, Server } from '../utils/server';
import * as os from 'os';

let server: Server;

const isWin = os.type() === 'Windows_NT';

describe('测试award-fetch  node apiGateWay', () => {
  beforeEach((done) => {
    const root = require
      .resolve('@/fixtures/basic/examples/c/index.tsx')
      .replace(isWin ? /\\index\.tsx$/ : /\/index\.tsx$/, '');
    process.chdir(root);
    process.env.RUN_ENV = 'node';
    process.env.NODE_ENV = 'development';
    jest.resetModules();
    server = createServer(done, { port: 10809 });
  });

  afterEach((done) => {
    if (server.close) {
      server.close(done);
    }
  });

  it('测试apiGateWay fail', async () => {
    process.env.API_ENV = '0';
    const fetch = require('award-fetch').default;

    server.use(async (ctx) => {
      ctx.body = 'hello world';
    });

    await new Promise((resolve) => {
      fetch('/api/list', {
        method: 'POST',
        dataType: 'text'
      }).catch((error: any) => {
        expect(error.message).toBe(`zkClient contented fail`);
        resolve();
      });
    });
  });

  it('测试apiGateWay run Error ip', async () => {
    process.env.API_ENV = '1';
    const fetch = require('award-fetch').default;

    server.use(async (ctx) => {
      ctx.body = 'hello world';
    });

    await new Promise((resolve) => {
      fetch('/api/list', {
        method: 'POST',
        dataType: 'text'
      }).catch((error: any) => {
        expect(error.message).toBe(`zkClient contented fail`);
        resolve();
      });
    });
  });
});
