import Plugin from 'award-plugin/node-plugin';
import fetch from 'award-fetch';

export default class extends Plugin {
  public apply() {
    this.server((hooks) => {
      // hooks.beforeRun(function (params) {
      //   params.app.use(async (ctx, next) => {
      //     console.log(333, ctx.path);
      //     await next();
      //   });
      // });
      hooks.modifyInitialPropsCtx(function (params) {
        params.params.fetch = fetch.bind(params.context);
      });
    });
  }
}
