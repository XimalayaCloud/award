import k2c = require('koa2-connect');
import * as fs from 'fs-extra';
import * as path from 'path';

export default (app: any, compiler: any) => {
  const devMiddleware = require('webpack-dev-middleware')(compiler, {
    logLevel: 'silent'
  });

  const hotMiddleware = require('webpack-hot-middleware')(compiler, {
    path: '/_award/webpack-hmr',
    log: false,
    heartbeat: 2500
  });

  // 加载dll资源
  app.use(async (ctx: any, next: any) => {
    // common.js
    if (/^\/common\.js/.test(ctx.request.url)) {
      const commonJs = path.join(process.cwd(), 'node_modules', '.award_dll', 'common.js');
      if (fs.existsSync(commonJs)) {
        ctx.status = 200;
        ctx.type = '.js';
        ctx.body = fs.createReadStream(commonJs);
        return;
      }
    }
    await next();
  });

  // 挂载webpack处理中间件
  app.use(k2c(devMiddleware));
  app.use(k2c(hotMiddleware));

  return [devMiddleware, hotMiddleware];
};
