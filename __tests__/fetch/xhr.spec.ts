import { createServer, Server } from '../utils/server';

let server: Server;

describe('测试award-fetch web xhr', () => {
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

  it('通用测试 GET', async () => {
    const fetch = require('award-fetch').default;

    server.use(async ctx => {
      ctx.body = { name: 'hello ' + ctx.query.name };
    });

    await new Promise(resolve => {
      fetch(server.url, {
        data: {
          name: 'world'
        },
        xhr: true
      }).then((data: any) => {
        expect(data.name).toBe(`hello world`);
        resolve();
      });
    });
  });

  it('通用测试 Error', async () => {
    const fetch = require('award-fetch').default;

    server.use(async ctx => {
      ctx.status = 500;
    });

    await new Promise(resolve => {
      fetch(server.url, {
        data: {
          name: 'world'
        },
        xhr: true
      }).catch((e: any) => {
        expect(e.message).toBe(`${server.url}: Internal Server Error`);
        resolve();
      });
    });
  });

  it('通用测试 network Error', async () => {
    const fetch = require('award-fetch').default;
    await new Promise(resolve => {
      fetch('/', {
        data: {
          name: 'world'
        },
        xhr: true
      }).catch((e: any) => {
        expect(e.message).toBe(`network error`);
        resolve();
      });
    });
  });

  it('通用测试 timeout', async () => {
    const fetch = require('award-fetch').default;

    server.use(async ctx => {
      await new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
      ctx.body = '';
    });

    await new Promise(resolve => {
      fetch(server.url, {
        data: {
          name: 'world'
        },
        timeout: 100,
        withCredentials: true
      }).catch((e: any) => {
        expect(e.message).toBe(`request ${server.url} timeout`);
        resolve();
      });
    });
  });

  it('通用测试 文件上传、下载', async () => {
    const fetch = require('award-fetch').default;
    const info = jest.fn();
    server.use(async ctx => {
      ctx.body = 'hello world';
    });

    await new Promise(resolve => {
      fetch(server.url, {
        method: 'POST',
        data: {
          name: 'world'
        },
        onDownloadProgress: () => {
          info();
        },
        onUploadProgress: () => {
          info();
        },
        dataType: null
      }).then((data: any) => {
        expect(data).toBe(`hello world`);
        expect(info).toHaveBeenCalledTimes(3);
        resolve();
      });
    });
  });

  it('通用测试 文件上传、下载时abort', async () => {
    const fetch = require('award-fetch').default;
    const info = jest.fn();
    server.use(async ctx => {
      await new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
      ctx.body = { name: 'hello world' };
    });

    await new Promise(resolve => {
      const source = fetch.source();
      fetch(server.url, {
        method: 'POST',
        data: {
          name: 'world'
        },
        onDownloadProgress: () => {
          info();
        },
        onUploadProgress: () => {
          info();
        },
        cancelToken: source.token
      }).catch((err: any) => {
        expect(err).toBe(`取消啦`);
        expect(info).toHaveBeenCalledTimes(0);
        source.cancel();
        resolve();
      });
      setTimeout(() => {
        source.cancel('取消啦');
      }, 10);
    });
  });

  it('通用测试 文件上传、下载时abort', async () => {
    const fetch = require('award-fetch').default;
    const info = jest.fn();
    server.use(async ctx => {
      await new Promise(resolve => {
        setTimeout(() => {
          resolve();
        }, 500);
      });
      ctx.body = { name: 'hello world' };
    });

    await new Promise(resolve => {
      const source = fetch.source();
      fetch(server.url, {
        method: 'POST',
        data: {
          name: 'world'
        },
        onDownloadProgress: () => {
          info();
        },
        onUploadProgress: () => {
          info();
        },
        cancelToken: source.token
      }).catch((err: any) => {
        expect(err.message).toBe(`request ${server.url} abort`);
        expect(info).toHaveBeenCalledTimes(0);
        resolve();
      });
      setTimeout(() => {
        source.cancel();
      }, 10);
    });
  });

  it('通用测试 POST formdata', async () => {
    const fetch = require('award-fetch').default;

    server.use(async ctx => {
      ctx.body = { name: 'hello ' + ctx.query.name };
    });

    // formdata
    const data = new FormData();
    data.append('id', '1');
    await new Promise(resolve => {
      fetch(server.url, {
        method: 'POST',
        params: {
          name: 'world'
        },
        data,
        xhr: true
      }).then((data: any) => {
        expect(data.name).toBe(`hello world`);
        resolve();
      });
    });
  });

  it('通用测试 POST data string', async () => {
    const fetch = require('award-fetch').default;

    server.use(async ctx => {
      ctx.body = { name: 'hello ' + ctx.request.body.name };
    });

    await new Promise(resolve => {
      fetch(server.url, {
        method: 'POST',
        data: 'name=world&id=1',
        xhr: true
      }).then((data: any) => {
        expect(data.name).toBe(`hello world`);
        resolve();
      });
    });

    await new Promise(resolve => {
      fetch(server.url, {
        method: 'POST',
        data: 'name=world&id=1',
        dataType: 'text',
        xhr: true
      }).then((data: any) => {
        expect(JSON.parse(data).name).toBe(`hello world`);
        resolve();
      });
    });

    await new Promise(resolve => {
      fetch(server.url, {
        method: 'POST',
        data: { name: 'world', id: null },
        dataType: 'text',
        xhr: true
      }).then((data: any) => {
        expect(JSON.parse(data).name).toBe(`hello world`);
        resolve();
      });
    });
  });

  it('通用测试 POST dataType object', async () => {
    const fetch = require('award-fetch').default;

    server.use(async ctx => {
      const data = JSON.parse(Object.keys(ctx.request.body)[0]);
      ctx.status = 200;
      ctx.body = { name: 'hello ' + data.name };
    });

    await new Promise(resolve => {
      fetch(server.url, {
        method: 'POST',
        data: { name: 'world' },
        dataType: 'object',
        xhr: true
      }).then((data: any) => {
        expect(data.name).toBe(`hello world`);
        resolve();
      });
    });

    await new Promise(resolve => {
      fetch(server.url, {
        method: 'POST',
        data: 'name=world&id=1',
        dataType: 'object',
        xhr: true
      }).then((data: any) => {
        expect(data.name).toBe(`hello world`);
        resolve();
      });
    });

    await new Promise(resolve => {
      fetch(server.url, {
        method: 'POST',
        dataType: 'object',
        xhr: true
      }).then((data: any) => {
        expect(data.name).toBe(`hello undefined`);
        resolve();
      });
    });
  });
});
