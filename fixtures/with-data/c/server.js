const Server = require('award/server');

const app = new Server();

app.listen(1234, listen => {
  listen.close();
});
