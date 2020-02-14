/**
 * 测试fetch，即配合getInitialProps函数进行测试
 */
import { createServer, Server } from '../utils/server';

let server: Server;

describe('测试award-fetch web', () => {
  beforeEach(done => {
    process.env.RUN_ENV = 'web';
    jest.resetModules();
    server = createServer(done);
  });

  afterEach(done => {
    if (server.close) {
      server.close(done);
    }
  });

  it('通用测试', async () => {
    const fetch = require('award-fetch').default;
    await new Promise(resolve => {
      fetch({}).catch((err: any) => {
        expect(err.message).toBe(`url empty`);
        resolve();
      });
    });
  });

  it('拦截器', async () => {
    const fetch = require('award-fetch').default;
    server.use(async ctx => {
      ctx.body = 'hello';
    });

    fetch.interceptors.request.use((req: any) => {
      req.dataType = 'string';
    });

    fetch.interceptors.request.use((req: any) => {
      req.basename = true;
      return req;
    });

    fetch.interceptors.response.use((res: any) => {
      res = res + ' world';
      return res;
    });

    const info = jest.fn();
    fetch.interceptors.response.use(() => {
      info();
    });

    await new Promise(resolve => {
      fetch(server.url).then((data: any) => {
        expect(data).toBe(`hello world`);
        expect(info).toHaveBeenCalledTimes(1);
        resolve();
      });
    });
  });

  it('测试basename', async () => {
    const fetch = require('award-fetch').default;
    // url地址拼接basename
    fetch.basename = true;
    const { loadParams } = require('award-utils');
    loadParams.set({ basename: '/api' });

    await new Promise(resolve => {
      fetch('/').catch((err: any) => {
        expect(err.message).toBe(`only absolute urls are supported`);
        resolve();
      });
    });

    await new Promise(resolve => {
      fetch('test').catch((err: any) => {
        expect(err.message).toBe(`only absolute urls are supported`);
        resolve();
      });
    });

    loadParams.set({ basename: '' });

    await new Promise(resolve => {
      fetch('test').catch((err: any) => {
        expect(err.message).toBe(`only absolute urls are supported`);
        resolve();
      });
    });
  });

  it('测试返回text', async done => {
    const fetch = require('award-fetch').default;
    server.use(async ctx => {
      ctx.body = 'hello world';
    });

    await new Promise(resolve => {
      fetch(server.url).catch((err: any) => {
        expect(err.type).toBe(`invalid-json`);
        resolve();
      });
    });

    await new Promise(resolve => {
      fetch(server.url, {
        dataType: 'text'
      }).then((data: any) => {
        expect(data).toBe('hello world');
        resolve();
      });
    });

    done();
  });

  it('测试无任何返回', done => {
    const fetch = require('award-fetch').default;
    fetch(server.url).then((response: any) => {
      expect(response.status).toBe(404);
      done();
    });
  });
});
