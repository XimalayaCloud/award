const Server = require('award/server');

// 实例化，获取app，构造函数接收对象
const app = new Server();

app.catch((errLogs, ctx) => {
  console.info('ctx', ctx.path);
  return errLogs;
});

// 监听端口
app.listen();
