import Plugin from 'award-plugin/lib/client/plugin';

export default class extends Plugin {
  public apply() {
    this.basic((hooks) => {
      hooks.modifyInitialPropsCtx((params) => {
        console.log(444, params);
      });
    });
  }
}
