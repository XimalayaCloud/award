/**
 * 子进程内部的global数据不能共享到父进程
 * 所以在子进程内的编译的共享数据内容需要存放到cache内
 */
import Koa = require('koa');
import prepare from '../tool/prepare';
import hmrStyle from './middlewares/hmrStyle';
import external from './middlewares/external';

prepare(true, false);

const app = new Koa();
app.use(async (ctx, next) => {
  ctx.set('Access-Control-Allow-Origin', ctx.headers.origin);
  ctx.set('Access-Control-Allow-Headers', 'content-type');
  ctx.set('Access-Control-Allow-Methods', 'OPTIONS,GET,HEAD,PUT,POST,DELETE,PATCH');
  await next();
});

app.use(hmrStyle());
app.use(external);

require('../build/dev/web')(app).then(() => {
  app.listen(process.env.CHILDPROCESS_COMPILER_PORT);
});
