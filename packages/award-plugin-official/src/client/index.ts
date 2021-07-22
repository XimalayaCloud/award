import Plugin from 'award-plugin/client-plugin';
import fetch from 'award-fetch';

export default class extends Plugin {
  public apply() {
    this.basic((hooks) => {
      // hooks.init(function () {
      //   console.log('init');
      // });
      hooks.modifyInitialPropsCtx((params) => {
        params.params.fetch = fetch;
      });
    });
  }
}
