// 引入服务端Server对象，这里的引用库和v2版本不同
const Server = require('award/server');

// 实例化，获取app，构造函数接收对象
const app = new Server();

// 监听端口
app.listenddd(3000);
