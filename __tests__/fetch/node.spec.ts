/**
 * 测试fetch，即配合getInitialProps函数进行测试
 */
import { createServer, Server } from '../utils/server';
import * as os from 'os';

let server: Server;
const isWin = os.type() === 'Windows_NT';

describe('测试award-fetch  node', () => {
  beforeEach((done) => {
    const root = require
      .resolve('@/fixtures/with-data/a/server.js')
      .replace(isWin ? /\\server\.js$/ : /\/server\.js$/, '');
    process.chdir(root);
    process.env.RUN_ENV = 'node';
    process.env.NODE_ENV = 'production';
    jest.resetModules();
    server = createServer(done);
  });

  afterEach((done) => {
    if (server.close) {
      server.close(done);
    }
  });

  it('通用测试 GET', async () => {
    const fetch = require('award-fetch').default;

    server.use(async (ctx) => {
      ctx.body = { name: 'hello ' + ctx.query.name };
    });

    await new Promise<void>((resolve) => {
      fetch(server.url, {
        data: {
          name: 'world'
        }
      }).then((data: any) => {
        expect(data.name).toBe(`hello world`);
        resolve();
      });
    });

    await new Promise<void>((resolve) => {
      fetch(server.url, {
        params: {
          name: 'world'
        }
      }).then((data: any) => {
        expect(data.name).toBe(`hello world`);
        resolve();
      });
    });

    await new Promise<void>((resolve) => {
      fetch(server.url, {
        body: {
          name: 'world'
        }
      }).then((data: any) => {
        expect(data.name).toBe(`hello world`);
        resolve();
      });
    });
  });

  it('通用测试 POST', async () => {
    const fetch = require('award-fetch').default;

    server.use(async (ctx) => {
      ctx.body = { name: 'hello ' + ctx.query.name + ctx.request.body.id };
    });

    await new Promise<void>((resolve) => {
      fetch(server.url, {
        method: 'POST',
        params: {
          name: 'world'
        },
        data: {
          id: 1
        }
      }).then((data: any) => {
        expect(data.name).toBe(`hello world1`);
        resolve();
      });
    });

    await new Promise<void>((resolve) => {
      fetch(server.url, {
        method: 'POST',
        params: {
          name: 'world'
        },
        body: {
          id: 2
        }
      }).then((data: any) => {
        expect(data.name).toBe(`hello world2`);
        resolve();
      });
    });

    await new Promise<void>((resolve) => {
      fetch(server.url, {
        method: 'POST',
        body: {
          id: 2
        },
        data: {
          id: 1
        }
      }).then((data: any) => {
        expect(data.name).toBe(`hello undefined1`);
        resolve();
      });
    });
  });
});
