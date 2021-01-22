import Plugin from 'award-plugin/node-plugin';
import fetch from 'award-fetch';

export default class extends Plugin {
  public apply() {
    this.server((hooks) => {
      hooks.modifyInitialPropsCtx(function (params) {
        params.params.fetch = fetch.bind(params.context);
      });
    });
  }
}
