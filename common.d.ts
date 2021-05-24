declare module 'node-thrift-pool';
declare module 'ansi-html';
declare module 'koa2-connect';
declare module 'ansi-parser';
declare module 'schema-utils';
declare module 'x-path';
declare module 'koa-websocket';

declare let __resourceQuery: string;

declare namespace NodeJS {
  export interface ProcessEnv {
    NODE_ENV: 'development' | 'production' | 'test' | undefined;
    BUILD_UMD: '1' | undefined;
    RUN_ENV: 'web' | 'node';
    WEB_TYPE: 'WEB_SPA' | 'WEB_SSR';
    Browser: string;
    ROUTER: string;
    CHILDPROCESS_COMPILER_URL: string;
    CHILDPROCESS_COMPILER_PORT: string;
    MAIN_PORT: string;
    EXPORTRUNHTML: string;
    USE_ROUTE: string;
  }

  export interface Global {
    inServer: boolean;
    AppRegistry: Function;
    __AWARD__PLUGINS__: {
      [name: string]: {
        name: string;
        default?: any;
      };
    };
    __AWARD__INIT__ROUTES__: Array<any>;
    EventEmitter: global.EventEmitter;

    style_cache_tip: boolean;
    style_hmr_tip: boolean;

    /**
     * 标识样式开始hmr了
     */
    style_hmr: boolean;
    /**
     * 标识当前样式是否发生变化的热更新
     * 该值用于是否通知客户端创建link链接
     */
    style_change_hmr: boolean;

    /**
     * 开发环境存储样式资源
     */
    storeStyleSheet: any;

    /**
     * 存储路由的引用文件名字
     */
    routeFileNames: Array<any>;
    /**
     * 第三方依赖的样式
     */
    moduleStyles: any;
    /**
     * 存储引用依赖
     */
    ImportSource: Array<any>;
    /**
     * 存储静态引用资源
     * key为资源导出的文件路径
     * value为资源内容实体
     */
    staticSource: {
      [key: string]: any;
    };
    /**
     * 存储样式关系
     */
    'es-style': {
      // 存放css module
      es: {
        [key: string]: any;
      };
      // 存放公共css资源
      style: { [key: string]: any };
      relation: {
        // 存放关系依赖
        es: {
          // hash => 多文件 {100:['a.js','b.js']}
          hash: { [key: string]: any };
          // 文件 => hash值  {'a.js': 100,'b.js':100}
          file: { [key: string]: any };
        };
        style: {
          hash: { [key: string]: any };
          file: { [key: string]: any };
        };
      };
    };
  }
}

interface Window {
  __AWARD__INIT__ROUTES__: Array<any>;
  __INITIAL_STATE__: any;
  hmr_initialState: any;
  award_hmr: boolean;
  award_hmr_error: {
    [key: any]: any;
  };
  ActiveXObject: any;
  jestMock: any;
}
