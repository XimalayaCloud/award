import Plugin from 'award-plugin';

export default class extends Plugin.Client {
  public apply() {
    this.basic((hooks) => {
      hooks.modifyInitialPropsCtx((params) => {
        console.log(444, params);
      });
    });
  }
}
