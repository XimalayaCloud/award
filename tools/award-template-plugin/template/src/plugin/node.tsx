import * as React from 'react';
import Plugin from 'award-plugin';

export default class extends Plugin.Node {
  public apply() {
    // 开始编写Node端执行hook逻辑
    this.render((hooks) => {
      hooks.document((params) => {
        params.doc.beforeHtml = (
          <h1 style={{ color: 'red' }}>这里的内容是通过插件注入的</h1>
        );
      });
    });
  }
}
