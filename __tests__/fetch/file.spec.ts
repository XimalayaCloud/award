/**
 * 测试一些配置文件
 */
import { createServer, Server } from '../utils/server';
import * as os from 'os';

let server: Server;

const isWin = os.type() === 'Windows_NT';

describe('测试file', () => {
  beforeEach(done => {
    const root = require
      .resolve('@/fixtures/with-data/c/index.tsx')
      .replace(isWin ? /\\index\.tsx$/ : /\/index\.tsx$/, '');
    process.chdir(root);
    process.env.RUN_ENV = 'web';
    process.env.WEB_TYPE = 'WEB_SPA';
    process.env.Browser = '0';
    process.env.NODE_ENV = 'development';
    jest.resetModules();
    server = createServer(done);
  });

  afterEach(done => {
    if (server.close) {
      server.close(done);
    }
  });

  it('浏览器file协议调试 url null', done => {
    process.env.Browser = '1';
    (window as any).AwardWebSocket = null;
    const fetch = require('award-fetch').default;
    fetch(server.url).catch((err: any) => {
      expect(err.message).toBe(`Cannot read property 'url' of null`);
      done();
    });
  });

  it('正常web调试', done => {
    const fetch = require('award-fetch').default;
    fetch(server.url).catch((err: any) => {
      expect(err.message).toBe(`${server.url}: Not Found`);
      done();
    });
  });
});
