const Server = require('award/server');

// 实例化，获取app，构造函数接收对象
const app = new Server();

// app.logFilter('show');

// 监听端口
app.listen(3000);
