import * as Koa from 'koa';
import * as koaBody from 'koa-body';
export interface Server extends Koa {
  url?: string;
  port?: string;
  protocol?: string;
  close?: Function;
}

export const createServer = function createServer(done: Function, options?: { port: any }) {
  const app: Server = new Koa();
  app.use(async (ctx, next) => {
    ctx.set('Access-Control-Allow-Origin', ctx.headers.origin);
    ctx.set('Access-Control-Allow-Headers', 'content-type');
    ctx.set('Access-Control-Allow-Methods', 'OPTIONS,GET,HEAD,PUT,POST,DELETE,PATCH');
    await next();
  });
  app.use(koaBody());
  const server = app.listen((options && options.port) || 0, function listen() {
    app.port = this.address().port;
    app.url = 'http://localhost:' + app.port;
    app.close = (callback: Function) => {
      server.close();
      if (callback) {
        callback();
      }
    };
    done();
  });
  return app;
};
