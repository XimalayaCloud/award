const Server = require('award/server');

const app = new Server();

app.use(async (ctx, next) => {
  if (ctx.path === '/api/list') {
    ctx.body = { name: 'hello world' };
    return;
  }
  await next();
});

app.core();

app.listen(11909);
