import { MatchedRoutes, AComponentType, IContext, IConfig } from 'award-types';
import { Compiler, Configuration } from 'webpack';

export interface DVAComponentType extends AComponentType {
  createDva: Function;
}

export interface INwillFetch {
  match_routes: MatchedRoutes<{}>;
  Component: DVAComponentType;
  context: IContext;
}
export type willFetch = (callback: (params: INwillFetch) => void) => void;

export interface INmodifyContextAward {
  context: IContext;
}
export type modifyContextAward = (callback: (params: INmodifyContextAward) => void) => void;

export interface INwillCache {
  /** context上下文 */
  context: IContext;
}
export type willCache = (callback: (params: INwillCache) => void) => void;

export interface INdidFetch {
  context: IContext;
}
export type didFetch = (callback: (params: INdidFetch) => void) => void;

export interface INmodifyInitialPropsCtx {
  params: any;
  context: IContext;
}
export type modifyInitialPropsCtx = (callback: (params: INmodifyInitialPropsCtx) => void) => void;
export interface IwebpackConfig {
  /** 当前系统内置的webpack配置 */
  config: Configuration;
  /** 当前的配置是否应用服务端编译 */
  isServer: boolean;
  /** 表示当前是否编译award项目内文件，即非server端文件 */
  isAward: boolean;
  /** 当前项目的根目录 */
  dir: string;
  /** 当前配置运行环境，开发、生产 */
  dev: boolean;
  /** 表示当前的webpack配置是否应用于dll */
  dll?: boolean;
  /** 表示当前项目的Award配置 */
  awardConfig: IConfig;
}
export type webpackConfig = (callback: (params: IwebpackConfig) => void) => void;

export interface IwebpackCompiler {
  /** 表示webpack的compiler对象 */
  compiler: Compiler;
  /** 当前系统内置的webpack配置 */
  config: Configuration;
  /** 当前的配置是否应用服务端编译 */
  isServer: boolean;
  /** 表示当前是否编译award项目内文件，即非server端文件 */
  isAward: boolean;
  /** 当前项目的根目录 */
  dir: string;
  /** 当前配置运行环境，开发、生产 */
  dev: boolean;
  /** 表示当前的webpack配置是否应用于dll */
  dll?: boolean;
  /** 表示当前项目的Award配置 */
  awardConfig: IConfig;
}
export type webpackCompiler = (callback: (params: IwebpackCompiler) => void) => void;

export interface CustomMiddlewares {
  /** 存储中间件的数组结构，原型链操作 */
  middlewares: Array<any>;
  /**
   * 当前项目的award配置
   */
  config: IConfig;
  /**
   * 当前服务端口
   */
  port: any;
  /**
   * 当前配置运行环境，开发、生产
   */
  dev: boolean;
}

export type Middlewares = (callback: (params: CustomMiddlewares) => void) => void;

export interface IbeforeBuild {
  run_env: 'node' | 'web_ssr' | 'web_spa';
  config: IConfig;
}
export type beforeBuild = (callback: (params: IbeforeBuild) => void) => void;

export interface IafterBuild {
  run_env: 'node' | 'web_ssr' | 'web_spa';
  config: IConfig;
}
export type afterBuild = (callback: (params: IafterBuild) => void) => void;

export interface IrenderToStringComponent {
  Component: any;
  context: IContext;
}
export type renderToStringComponent = (
  callback: (params: IrenderToStringComponent) => void
) => void;

export interface IafterRender {
  context: IContext;
  html: any;
}
export type afterRender = (callback: (params: IafterRender) => void) => void;

export interface IbeforeRender {
  context: IContext;
}
export type beforeRender = (callback: (params: IbeforeRender) => void) => void;

export interface IbabelConfig {
  config: {
    plugins: Array<any>;
    presets: Array<any>;
  };
  isServer: boolean;
  dev: boolean;
  awardConfig: IConfig;
}
export type babelConfig = (callback: (params: IbabelConfig) => void) => void;

export interface Idocument {
  context: IContext;
  doc: {
    beforeHead: any;
    afterHead: any;
    beforeScript: any;
    afterScript: any;
    beforeHtml: any;
    afterHtml: any;
  };
}
export type document = (callback: (params: Idocument) => void) => void;

export interface Isource {
  dir: string;
  dist: string;
}
export type source = (callback: (params: Isource) => void) => void;

export interface NodeHooks {
  modifyContextAward: modifyContextAward;
  modifyInitialPropsCtx: modifyInitialPropsCtx;
  didFetch: didFetch;
  willFetch: willFetch;
  willCache: willCache;
  webpackConfig: webpackConfig;
  webpackCompiler: webpackCompiler;
  beforeCoreMiddlewares: Middlewares;
  afterCoreMiddlewares: Middlewares;
  beforeBuild: beforeBuild;
  afterBuild: afterBuild;
  beforeRender: beforeRender;
  render: renderToStringComponent;
  afterRender: afterRender;
  babelConfig: babelConfig;
  document: document;
  source: source;
}
