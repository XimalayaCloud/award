/**
 * 测试一些配置文件
 */
import * as os from 'os';
import WebSocket = require('ws');

const isWin = os.type() === 'Windows_NT';

describe('测试file', () => {
  beforeEach(() => {
    const root = require
      .resolve('@/fixtures/with-data/b/index.js')
      .replace(isWin ? /\\index\.js$/ : /\/index\.js$/, '');
    process.chdir(root);
    process.env.RUN_ENV = 'web';
    process.env.WEB_TYPE = 'WEB_SPA';
    process.env.Browser = '1';
    jest.resetModules();
  });

  it('浏览器file协议调试', done => {
    const ws = new WebSocket.Server({ port: 12399 });
    ws.on('connection', (wss: any) => {
      wss.on('message', (message: any) => {
        if (wss.readyState === 1) {
          wss.send(JSON.stringify({ name: JSON.parse(message).url }));
        }
      });
    });
    (window as any).AwardWebSocket = {
      url: 'ws://127.0.0.1:12399'
    };
    const fetch = require('award-fetch').default;
    fetch('/api/list').then((data: any) => {
      expect(data.name).toBe('/api/list');
      ws.close(done);
    });
  });
});
