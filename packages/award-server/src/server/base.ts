/**
 * Server对象的基础类
 */
import * as Koa from 'koa';
import { Seq, List, fromJS } from 'immutable';
import * as fs from 'fs-extra';
import * as Path from 'path';
import * as _ from 'lodash';

/** 基础中间件 */
import HttpsMiddleware from '../middleware/basic/https';
import BasicInitMiddleware from '../middleware/basic/init';
import ExternalMiddleware from '../middleware/basic/external';
import StaticMiddleware from '../middleware/basic/static';
import ProxyMiddleware from '../middleware/basic/proxy';

/** 核心中间件 */
import CoreInitMiddleware from '../middleware/kernel/init';
import CacheMiddleware from '../middleware/kernel/cache';
import FetchMiddleware from '../middleware/kernel/fetch';
import RenderMiddleware from '../middleware/kernel/render';

import { IServerEntry, IContext, AComponentType, IConfig } from 'award-types';
import { getAwardConfig, extensions } from 'award-utils/server';
import nodePlugin from 'award-plugin/node';
import { loadParams } from 'award-utils';

import pkg = require('../../package.json');

/**
 * 定义核心变量
 */
let isCore = false;

export default class Base {
  public dir: string; /** 项目根目录地址 */
  public dev: boolean; /** 环境 */
  public isMock: boolean; /** 是否开启mock */
  public isProxy: boolean; /** 是否开启代理 */
  public port: string | number; /** 端口 */
  public apiServer: boolean; /** 当前网站仅仅作为一个api，即只需要添加mock或者proxy中间件 */
  public app: Koa; /** koa的app对象 */
  public config: Seq.Keyed<string, any>; /** award.config.js配置 */
  public ignore: boolean; /** 开发环境是否忽略系统错误页面 */
  public RootPageEntry: string; /** 页面入口 */
  public routes: List<any>; /** 所有路由集合 */
  public RootComponent: AComponentType | null; /** 入口组件 */
  public RootDocumentComponent: AComponentType | null; /** 文档组件 */
  public map: Seq.Keyed<string, any>; /** map列表 */
  public logFilterInfo: any[] = []; /** log过滤关键词 */
  public ErrorCatchFunction: Function | null = null;
  public renderReactToString: Function | null = null;

  public manifestFile = ''; /** manifest文件 */
  public favicon = null; /** favicon图标 */
  public httpsOptions = {}; /** https配置信息 */

  /**
   *
   * ***
   * [
   *
   * `1`,`https中间件`
   *
   * `2`,`初始化数据中间件`
   *
   * `3`,`外部文件中间件`
   *
   * `4`,`静态资源中间件`
   *
   * `5`,`代理服务中间件`
   *
   * `6`,`核心参数ctx.award注册中间件`
   *
   * ]
   * ***
   */
  public middlewares: Array<Koa.Middleware<any, IContext>> = [];

  /**
   * 系统内置中间件
   *
   * 服务端渲染执行中间件，不能被随意销毁
   * 1. 判断是否缓存，命中缓存 cache
   * 2. 根据匹配到的地址解析对应接口数据 fetch
   * 3. 根据接口数据、匹配组件渲染出html render
   */
  public coreMiddlewares: Array<Koa.Middleware<any, IContext>> = [];

  public beforeCoreMiddlewares: Array<Koa.Middleware<any, IContext>> = [];
  public afterCoreMiddlewares: Array<Koa.Middleware<any, IContext>> = [];

  /**
   * 路由参数信息
   */
  public routerRoot: string;
  public routerFile: string;

  /**
   * Server初始化构造函数之参数说明
   *
   * @param isProxy     标识是否启用proxy获取数据
   * @param port        指定当前服务器的端口号
   * @param ignore      忽略显示系统默认错误，仅在开发环境生效，主要用于错误页面开发
   * @param apiServer   标识当前的服务器是否仅仅可以作为一个接口数据代理服务，比如可以当作一个mock服务器或者proxy服务器
   */
  public constructor({
    dev = false,
    isMock = false,
    isProxy = false,
    port = 1234,
    ignore = false,
    apiServer = false,
    devFun = null
  }: IServerEntry = {}) {
    process.env.RUN_ENV = 'node';
    if (devFun) {
      devFun();
    } else {
      process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    }
    this.dev = dev;
    this.dir = process.cwd();
    this.isMock = isMock;
    this.isProxy = isProxy;
    this.port = port;
    this.apiServer = apiServer;
    this.app = new Koa();

    /** 设置获取的数据不可变 */
    const config: IConfig = getAwardConfig(this.dir);

    loadParams.set({ basename: config.basename });

    if (config.plugins && config.plugins.length) {
      nodePlugin.unregister();
      nodePlugin.register(config.plugins);
    }

    // 处理basename中间件
    this.app.use(async (ctx, next) => {
      ctx.awardConfig = config;
      if (this.dev) {
        ctx.awardConfig = getAwardConfig(this.dir, true);
      }
      if (config.basename) {
        const reg = new RegExp(`^${config.basename}`);
        if (reg.test(ctx.path)) {
          ctx.path = ctx.path.replace(reg, '');
          if (!ctx.path) {
            ctx.path = '/';
          }
        }
      }
      await next();
    });

    this.config = Seq(config);
    this.ignore = ignore;
    this.RootPageEntry = '';
    this.routes = fromJS([]);
    this.RootComponent = null;
    this.RootDocumentComponent = null;
    this.map = Seq({});

    this.extensions(config);
    this.ErrorCatchFunction = (log: any) => {
      if (log) {
        console.error(JSON.stringify(log));
      }
    };

    global.AppRegistry = (Component: any) => {
      this.RootComponent = Component;
    };

    /**
     * 证书判断
     */
    if (this.port === '443') {
      const _pkg = require(Path.join(this.dir, 'package.json'));
      const key = Path.join(this.dir, _pkg.name + '.key');
      const cert = Path.join(this.dir, _pkg.name + '.crt');

      if (!fs.existsSync(key)) {
        throw new Error(`https需要的key不存在，存储路径为:${key}`);
      }

      if (!fs.existsSync(cert)) {
        throw new Error(`https需要的cert不存在，存储路径为:${cert}`);
      }

      this.httpsOptions = {
        key: fs.readFileSync(key),
        cert: fs.readFileSync(cert)
      };
    }
  }

  /**
   * 注册中间件
   */
  public registerMiddlewares() {
    this.middlewares.push(
      HttpsMiddleware.call(this),
      BasicInitMiddleware.call(this, pkg.version),
      ExternalMiddleware.call(this),
      StaticMiddleware.call(this),
      ProxyMiddleware.call(this),
      CoreInitMiddleware.call(this)
    );

    if (!this.apiServer) {
      this.coreMiddlewares.push(CacheMiddleware(), FetchMiddleware(), RenderMiddleware.call(this));
    }
  }

  /**
   * 开启require扩展识别，开发环境被重写
   */
  public extensions(config: IConfig) {
    extensions(config);
  }

  /**
   * 挂载所有中间件
   */
  public loadAllMiddlewares() {
    this.middlewares.forEach(middleware => {
      this.app.use(middleware);
    });
  }

  /**
   * 中间件
   */
  public use(middleware: Koa.Middleware<any, IContext>) {
    if (isCore) {
      this.afterCoreMiddlewares.push(middleware);
    } else {
      this.beforeCoreMiddlewares.push(middleware);
    }
  }

  /**
   * 核心
   */
  public core() {
    isCore = true;
  }

  /**
   * 日志过滤器
   */
  public logFilter() {
    this.logFilterInfo = Array.from(arguments);
  }

  public log(cb: Function) {
    if (this.dev) {
      console.warn(
        '[development] 请使用app.catch替换app.log，使用方式一致，在不久的将来会废除app.log'
      );
    }
    this.handleError(cb);
  }

  /**
   *
   * 开发者可以根据node产生的错误进行自定义过滤出来
   *
   * 回调参数的error对象数据仅生产环境生效
   *
   * 如果没有将errLogs返回，那么将不会打印错误日志
   *
   * ```
   * app.catch(errLogs => {
   *   // 开发阶段、errLogs为null
   *   // 可以自行处理errLogs，决定是否将错误errLogs发送到终端，即打印日志
   *   return newErrLogs;
   * })
   * ```
   *
   */
  public catch(cb: Function) {
    this.handleError(cb);
  }

  public router(root: string, routerFile: string) {
    this.routerRoot = root;
    this.routerFile = routerFile;
  }

  private handleError(cb: Function) {
    if (typeof cb === 'function') {
      this.ErrorCatchFunction = (log: any) => {
        const _log = cb(log);
        if (_log && _.isObject(_log)) {
          console.error(JSON.stringify(_log));
        }
      };
    }
  }
}
