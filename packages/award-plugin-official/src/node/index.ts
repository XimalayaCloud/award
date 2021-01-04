import Plugin from 'award-plugin';

export default class extends Plugin.Node {
  public apply() {
    this.server((hooks) => {
      hooks.modifyInitialPropsCtx(function (params) {
        console.log(3333, params);
      });
    });
  }
}
