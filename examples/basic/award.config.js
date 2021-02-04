const fs = require('fs');

const middleware = async (ctx, next) => {
  if (ctx.path === '/api/list') {
    ctx.body = { num: 'hello' + Math.random() };
  } else {
    await next();
  }
};

export default {
  basename: '/abc',
  // mode: 'client',
  fetch: {
    domainMap: {
      '/api': 'http://127.0.0.1:1236'
    }
  },
  app: (middlewares) => {
    middlewares.splice(0, 0, middleware);
  }
};
