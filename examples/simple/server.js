const Server = require('award/server');

const app = new Server();

app.use(async (ctx, next) => {
  console.info(123, ctx.path);
  await next();
});

app.listen();
