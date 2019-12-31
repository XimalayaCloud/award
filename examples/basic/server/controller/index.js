module.exports = class {
  upload(ctx) {
    ctx.body = `Request Body: ${JSON.stringify(ctx.request.body)}`;
  }

  list(ctx) {
    ctx.body = { num: Math.random() };
  }
};
