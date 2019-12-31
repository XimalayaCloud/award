let Node = class {
  public apply() {
    throw new Error('当前插件只作用于Node环境');
  }
};
let Client = class {
  public apply() {
    throw new Error('当前插件只作用于Client环境');
  }
};
if (process.env.RUN_ENV === 'web') {
  Client = require('./client/plugin').default;
}

if (process.env.RUN_ENV === 'node') {
  Node = require('./node/plugin').default;
}

export default {
  Node,
  Client
};
