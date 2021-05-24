import { IAny, ITextObj } from './util';
import { Middleware } from 'koa';

// 解析路由 -> 获取数据 -> 开始渲染 -> 返回html
export interface IAwardConfig {
  /** js入口文件 */
  entry: string;
  /** 路由前缀 */
  basename: string;
  /** 静态资源前缀 */
  assetPrefixs: string;
  /** 本地开发时，静态资源地址前缀是否添加ip+port，默认不添加，以斜杠开头 */
  assetOrigin: boolean;
  /** crossOrigin */
  crossOrigin: boolean;
  /** 自由扩展中间件 */
  app: (middlewares: Middleware[]) => Middleware[];
  /** award build 服务端的代码输出目录 */
  server_dist: string;
  /** award build 客户端的代码输出目录 */
  client_dist: string;
  /** award export 导出的代码输出目录 */
  export_dist: string;
  /** award export 导出的html结构地址 */
  exportPath: Array<any>;
  /** webpack配置自定义 */
  webpack?: Function;
  /** 默认为服务端渲染 */
  mode: 'server' | 'client';
  /** 配置路由类型，只针对export导出时生效，其他时候都是默认的browser类型 */
  router: 'browser' | 'hash';
  /** 当前入口静态资源是否使用hashName */
  hashName: boolean;
  /** 设置接口代理 */
  proxyTable: IAny;
  /** 移除fetch.config.js，之前的配置内容转移到这里 */
  fetch: {
    /** domain映射 {"api": "localhost"} */
    domainMap?: ITextObj;
    apiGateway?: ITextObj;
  };
  plugins: Array<any>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AwardConfig extends Partial<IAwardConfig> {}

export interface IConfig extends IAwardConfig {
  __fetch?: any;
  /** 自定义award.config文件路径 默认:'award.config.js' */
  configOrigin?: string;
}
