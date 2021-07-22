const Plugin = require('award-plugin').default;

module.exports = class extends Plugin.Node {
  apply() {
    this.server((hooks) => {
      hooks.beforeRun((params) => {
        params.app.use(async (ctx, next) => {
          console.log('from-award插件：', ctx.path);
          await next();
        });
      });
    });
  }
};
