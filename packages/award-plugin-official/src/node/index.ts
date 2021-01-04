import Plugin from 'award-plugin/lib/node/plugin';

export default class extends Plugin {
  public apply() {
    this.server((hooks) => {
      hooks.modifyInitialPropsCtx(function (params) {
        console.log(3333, params);
      });
    });
  }
}
