const Server = require('award/server');
const koaBody = require('koa-body');
const app = new Server();
app.use(koaBody());
app.router(__dirname, './routes.js');

app.listen(1234);
