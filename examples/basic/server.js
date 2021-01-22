const Server = require('award/server');

// 实例化，获取app，构造函数接收对象
const app = new Server();

app.use(async (ctx, next) => {
  if (ctx.path === '/api/error') {
    ctx.status = 500;
    ctx.body = 'hello';
    return;
  }
  await next();
});

app.catch((errLogs, ctx) => {
  console.info('ctx', ctx.path);
  return errLogs;
});

// 监听端口
app.listen(1234);
