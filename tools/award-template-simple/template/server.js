/**
 * 开发         node server.js dev
 * 编译后生产运行 node server.js
 */

const Server = require("award/server");
const app = new Server();
app.listen(1234);
