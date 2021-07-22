import {
  Middlewares,
  modifyContextAward,
  modifyInitialPropsCtx,
  willCache,
  willFetch,
  didFetch,
  beforeRender,
  renderToStringComponent,
  afterRender,
  beforeBuild,
  afterBuild,
  webpackConfig,
  babelConfig,
  webpackCompiler,
  document,
  source,
  babelInclude,
  beforeRun
} from '../../types/node';
import Node from './';
import { parseAsync } from '../utils';

export interface ServerHooks {
  /**
   *
   * node服务启动前的插件钩子，仅支持同步逻辑
   * 
  | 参数        | 说明                             | 类型    |
  | ----------- | -------------------------------- | ------- |
  | app         | 当前node服务的Koa示例            | Koa   |
  | config      | 当前项目的award配置              | object  |
  | dev         | 当前配置运行环境，开发、生产     | boolean |
   */
  beforeRun: beforeRun;

  /**
   * 在award内部的核心中间件之前注入中间件的hook函数

| 参数        | 说明                             | 类型    |
| ----------- | -------------------------------- | ------- |
| middlewares | 存储中间件的数组结构，原型链操作 | Array   |
| config      | 当前项目的award配置              | object  |
| port        | 当前服务端口                     | string  |
| dev         | 当前配置运行环境，开发、生产     | boolean |
   */
  beforeCoreMiddlewares: Middlewares;

  /**
   * 在award内部的核心中间件之后注入中间件的hook函数

| 参数        | 说明                             | 类型    |
| ----------- | -------------------------------- | ------- |
| middlewares | 存储中间件的数组结构，原型链操作 | Array   |
| config      | 当前项目的award配置              | object  |
| port        | 当前服务端口                     | string  |
| dev         | 当前配置运行环境，开发、生产     | boolean |
   */
  afterCoreMiddlewares: Middlewares;

  /**
   * 修改ctx.award的变量结构，原则上只允许添加，不允许删除

| 参数    | 说明                      | 类型   |
| ------- | ------------------------- | ------ |
| context | 服务端的`koa`的上下文对象 | object |
   */
  modifyContextAward: modifyContextAward;

  /**
   *修改在服务端运行时，当执行`getInitialProps`函数时，处理该函数接收到的参数

| 参数    | 说明                      | 类型   |
| ------- | ------------------------- | ------ |
| context | 服务端的`koa`的上下文对象 | object |
| params  | 服务端默认传递的参数内容  | object |
   */
  modifyInitialPropsCtx: modifyInitialPropsCtx;

  /**
   * 在服务端处理缓存之前，触发该函数

| 参数    | 说明                      | 类型   |
| ------- | ------------------------- | ------ |
| context | 服务端的`koa`的上下文对象 | object |
   */
  willCache: willCache;

  /**
   * 在服务器获取数据之前，触发该函数

| 参数    | 说明                      | 类型   |
| ------- | ------------------------- | ------ |
| context | 服务端的`koa`的上下文对象 | object |
   */
  willFetch: willFetch;

  /**
   * 在服务端获取完数据之后，触发该函数

|   参数    | 说明                      | 类型   |
| ------- | ------------------------- | ------ |
| context | 服务端的`koa`的上下文对象 | object |
   */
  didFetch: didFetch;
}

export interface RenderHooks {
  /**
   *  award在服务端渲染之前，即在执行`renderToString`函数之前一行

 | 参数    | 说明                      | 类型   |
 | ------- | ------------------------- | ------ |
 | context | 服务端的`koa`的上下文对象 | object |
   */
  beforeRender: beforeRender;

  /**
   * 执行`renderToString`函数所接受的参数

 | 参数      | 说明                          | 类型          |
 | --------- | ----------------------------- | ------------- |
 | context   | 服务端的`koa`的上下文对象     | object        |
 | Component | renderToString接受的react组件 | React.Element |
   */
  render: renderToStringComponent;

  /**
   * award在服务端渲染，或者在导出单页应用时，对document进行整理
   *
   */
  document: document;

  /**
   * award在服务端渲染之后，即在执行`renderToString`函数之后一行

 | 参数         | 说明                                                    | 类型          |
 | ------------ | ------------------------------------------------------- | ------------- |
 | context      | 服务端的`koa`的上下文对象                               | object        |
 | head         | 生成的html文档的头部内容，包括一些样式地址、meta信息等  | React.Element |
 | script       | 生成的html文档的脚本内容，包括类似main.js客户端入口脚本 | React.Element |
 | html         | `renderToString`执行后生成的html字符串                  | string        |
 | initialState | 服务端执行所产生的数据，此数据将提供给客户端渲染        | object        |
   */
  afterRender: afterRender;
}

export interface BuildHooks {
  /**
   * award项目执行`award build`构建命令之前
   *

| 参数    | 说明                | 类型                             |
| ------- | ------------------- | -------------------------------- |
| run_env | 构建的环境类型      | 'node' 、 'web_ssr' 、 'web_spa' |
| config  | 当前项目的award配置 | object                           |
   */
  beforeBuild: beforeBuild;

  /**
   * 在web编译阶段，判断babel插件是否需要处理该文件，类似webpack include用法，该钩子只支持同步
   *
   * 需要注意：仅web编译可以使用，包括开发环境和编译出生产环境的静态资源
   *
   * `只接受一个参数filePath，表示当前文件路径；如果需要处理成功，需要给出返回值，类型为boolean`
   *
   * ## award内部默认处理规则
   * - 不忽略 node_modules/award
   * - 忽略 node_modules 该钩子会在这个阶段执行
   * - 其余都不忽略
   *
   *
   * ```js
   * import Plugin from 'award-plugin';
   * export default class extends Plugin.Node{
   *  apply(){
        this.build(hooks=>{
          hooks.babelInclude(function(filePath){
              // 当award内部的默认规则要求babel-loader忽略对该文件的处理后.....
              // 紧接着立刻触发该钩子
              // 接着你就可以通过正则匹配决定是否处理该文件路径
              // 如果不返回，或者返回false，那么babel-loader就不再处理该文件了
              // 只有返回true才会处理该文件
              return ...
            })
          })
        }
      }
   * ```
   */
  babelInclude: babelInclude;

  /**
   *
   * 处理编译后的静态资源
   *
   */
  source: source;

  /**
   * award项目执行`award build`构建命令之后


| 参数    | 说明                | 类型                             |
| ------- | ------------------- | -------------------------------- |
| run_env | 构建的环境类型      | 'node' 、 'web_ssr' 、 'web_spa' |
| config  | 当前项目的award配置 | object                           |
   */
  afterBuild: afterBuild;
}

export interface ConfigHooks {
  /**
   * 处理webpack的配置文件

| 参数     | 说明                                              | 类型    |
| -------- | ------------------------------------------------- | ------- |
| config   | 当前系统内置的webpack配置                         | object  |
| isServer | 当前的配置是否应用服务端编译                      | boolean |
| isAward  | 表示当前是否编译award项目内文件，即非server端文件 | boolean |
| dir      | 当前项目的根目录                                  | string  |
| dev      | 当前配置运行环境，开发、生产                      | boolean |
| dll      | 表示当前的webpack配置是否应用于dll                | boolean |
   */
  webpackConfig: webpackConfig;

  /**
   * 添加新的babel配置，该钩子只支持同步
   *
| 参数        | 说明                         | 类型                                               |
| ----------- | ---------------------------- | -------------------------------------------------- |
| config      | 当前babel的配置结构          | object { plugins: Array<any>;presets: Array<any>;} |
| awardConfig | 当前系统内置的webpack配置    | object                                             |
| isServer    | 当前的配置是否应用服务端编译 | boolean                                            |
| dev         | 当前配置运行环境，开发、生产 | boolean                                            |
   */
  babelConfig: babelConfig;
}

export interface CompilerHooks {
  /**
   * 处理webpack编译后的compiler

| 参数     | 说明                                              | 类型    |
| -------- | ------------------------------------------------- | ------- |
| compiler | webpack编译的对象结构                             | object  |
| config   | 当前系统内置的webpack配置                         | object  |
| isServer | 当前的配置是否应用服务端编译                      | boolean |
| isAward  | 表示当前是否编译award项目内文件，即非server端文件 | boolean |
| dir      | 当前项目的根目录                                  | string  |
| dev      | 当前配置运行环境，开发、生产                      | boolean |
| dll      | 表示当前的webpack的编译是否对dll进行编译          | boolean |

   */
  webpackCompiler: webpackCompiler;
}

export interface DocumentHooks {
  beforeHead: any;
  afterHead: any;
  beforeScript: any;
  afterScript: any;
}

class Plugin {
  private __plugin__self__hooks__: any;
  private __plugin__name__: string;

  /**
   * 插件动态变量对象
   */
  public options: any = {};

  protected constructor(hooks: any, options: any = {}, name: string) {
    this.__plugin__self__hooks__ = hooks;
    this.__plugin__name__ = name;
    this.options = options;
  }

  private method(
    callback: Function,
    methodName: 'server' | 'build' | 'config' | 'compiler' | 'render'
  ) {
    const self = this;
    const obj: any = {};
    Node.names[methodName].forEach((name) => {
      const { name: fnName } = parseAsync(name);
      obj[fnName] = function () {
        self.__plugin__self__hooks__[fnName](...arguments);
      };
    });
    try {
      callback(obj);
    } catch (error) {
      console.error(`[ plugin-name: ${this.__plugin__name__} ] Node端注册插件时发生错误\n${error}`);
    }
  }

  /**
   * 执行服务端运行阶段的钩子函数
   *
   * 主要对上下文参数的处理、中间件的处理以及数据加载和渲染逻辑的自定义调整
   *
   * `modifyContextAward`
   *
   * `modifyInitialPropsCtx`
   *
   * `willCache`
   *
   * `willFetch`
   *
   * `didFetch`
   *
   * `beforeCoreMiddlewares`
   *
   * `afterCoreMiddlewares`
   */
  public server(callback: (hooks: ServerHooks) => void) {
    this.method(callback, 'server');
  }

  /**
   * 渲染阶段触发钩子
   *
   * `beforeRender`
   *
   * `render`
   *
   * `document`
   *
   * `afterRender`
   */
  public render(callback: (hooks: RenderHooks) => void) {
    this.method(callback, 'render');
  }

  /**
   * build阶段执行钩子
   *
   * `beforeBuild`
   *
   * `source`
   *
   * `afterBuild`
   */
  public build(callback: (hooks: BuildHooks) => void) {
    this.method(callback, 'build');
  }

  /**
   * 自定义处理配置文件
   *
   * `webpackConfig`
   *
   * `babelConfig`
   */
  public config(callback: (hooks: ConfigHooks) => void) {
    this.method(callback, 'config');
  }

  /**
   * 处理编译解决的场景，目前有webpack编译阶段的处理
   *
   * `webpackCompiler`
   */
  public compiler(callback: (hooks: CompilerHooks) => void) {
    this.method(callback, 'compiler');
  }
}

export default Plugin;
