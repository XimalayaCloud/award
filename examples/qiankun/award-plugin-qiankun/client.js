const Plugin = require('award-plugin').default;

module.exports = class extends Plugin.Client {
  apply() {
    this.basic((hooks) => {
      hooks.mount(() => document.getElementById('root'));
    });
  }
};
