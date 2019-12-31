declare module 'award-plugin' {
  import AwardNodePlugin from 'award-plugin/lib/node/plugin';
  import AwardClientPlugin from 'award-plugin/lib/client/plugin';
  export * from 'award-plugin/types/client';
  export * from 'award-plugin/types/node';

  /**
   * Award插件核心API
   ```
   export default class extends Plugin.Node{}

   export default class extends Plugin.Client{}
   ```
   */
  const Plugin = {
    /**
     * Node环境运行的插件类
     */
    Node: AwardNodePlugin,

    /**
     * 客户端环境（浏览器）运行的插件类
     */
    Client: AwardClientPlugin
  };

  export default Plugin;
}
