import k2c = require('koa2-connect');
import { parse } from 'url';

const pathMatch = function (url: any, path: any) {
  try {
    return parse(url).pathname === path;
  } catch (e) {
    return false;
  }
};

export default () => {
  const eventStream = createEventStream(2000);
  const middleware = function (req: any, res: any, next: any) {
    if (!pathMatch(req.url, '/_award/style-hmr')) return next();
    eventStream.handler(req, res);
  };

  global.EventEmitter.on('hmrStyle', (info) => {
    eventStream.publish(info);
  });

  return k2c(middleware);
};

function createEventStream(heartbeat: any) {
  let clientId = 0;
  let clients: any = {};
  function everyClient(fn: any) {
    Object.keys(clients).forEach(function (id) {
      fn(clients[id]);
    });
  }
  let interval = setInterval(function heartbeatTick() {
    everyClient(function (client: any) {
      client.write('data: \uD83D\uDC93\n\n');
    });
  }, heartbeat).unref();
  return {
    close: function () {
      clearInterval(interval);
      everyClient(function (client: any) {
        if (!client.finished) client.end();
      });
      clients = {};
    },
    handler: function (req: any, res: any) {
      let headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'text/event-stream;charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        // While behind nginx, event stream should not be buffered:
        // http://nginx.org/docs/http/ngx_http_proxy_module.html#proxy_buffering
        'X-Accel-Buffering': 'no'
      };

      let isHttp1 = !(parseInt(req.httpVersion, 10) >= 2);
      if (isHttp1) {
        req.socket.setKeepAlive(true);
        Object.assign(headers, {
          Connection: 'keep-alive'
        });
      }

      res.writeHead(200, headers);
      res.write('\n');
      let id = clientId++;
      clients[id] = res;
      req.on('close', function () {
        if (!res.finished) res.end();
        delete clients[id];
      });
    },
    publish: function (payload: any) {
      everyClient(function (client: any) {
        client.write('data: ' + JSON.stringify(payload) + '\n\n');
      });
    }
  };
}
