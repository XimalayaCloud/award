/**
 * Award服务端核心代码
 */
import * as https from 'https';
import * as http from 'http';
import * as path from 'path';
import * as Loadable from 'react-loadable';
import nodePlugin from 'award-plugin/node';
import { IConfig, IContext } from 'award-types';
import * as _ from 'lodash';
import * as fs from 'fs-extra';
import * as Router from 'koa-router';
import { serverInfo } from 'award-utils/server';
import resource from '../utils/resource';
import Base from './base';

export type callback = (listen: http.Server | https.Server, url: string, open: Function) => void;

/**
 * 定义服务端环境变量
 */
Object.defineProperty(global, 'inServer', {
  writable: false,
  configurable: false,
  enumerable: true,
  value: true
});

/**
 * Server初始化构造函数之参数说明
 *
 * @param isMock      标识是否启用mock中间件获取数据
 * @param isProxy     标识是否启用proxy获取数据
 * @param port        指定当前服务器的端口号
 * @param ignore      忽略显示系统默认错误，仅在开发环境生效，主要用于错误页面开发
 * @param apiServer   标识当前的服务器是否仅仅可以作为一个接口数据代理服务，比如可以当作一个mock服务器或者proxy服务器
 */
export class Server extends Base {
  /**
   *
   * 开启端口监听
   *
   * 示例
   *
    ```

    app.listen(1234, ( listen, url, open ) => {
        // listen 当前koa监听对象
        // url    ip地址+端口 = url
        // open   打开浏览器，比如本地hosts配置 example.com
        open('http://example.com:1234/')
    });

    ```
   */
  public async listen(port?: string | number | callback, cb?: callback | null) {
    if (typeof port === 'string' || typeof port === 'number') {
      this.port = port;
    } else if (typeof port === 'function') {
      // eslint-disable-next-line no-param-reassign
      cb = port;
    }
    this.startListen(cb);
  }

  /**
   * 初始化listen
   */
  public async startListen(cb: callback | null = null) {
    try {
      const self = this;

      await this.init();

      // 中间件热替换
      const hmrBeforeMiddleware = (
        middlewareCallback: Function,
        startLength: number,
        middlewareLength: number
      ) => {
        // 热更新中间件的长度
        return async function hmrbeforeMiddleware(ctx: IContext, next: Function) {
          let error = null;

          try {
            // 重新获取热更新区域的中间件，通过对数组进行splice的方式进行处理
            const middlewares = await middlewareCallback();
            self.app.middleware.splice(startLength, middlewareLength, ...middlewares);
            middlewareLength = middlewares.length;

            await next();
          } catch (err) {
            error = err;
          }

          if (error) {
            throw error;
          }
        };
      };

      const hmrAfterMiddleware = (
        middlewareCallback: Function,
        startLength: number,
        middlewareLength: number
      ) => {
        // 热更新中间件的长度
        return async function hmrafterMiddleware(ctx: IContext, next: Function) {
          let error = null;

          try {
            // 重新获取热更新区域的中间件，通过对数组进行splice的方式进行处理
            const middlewares = await middlewareCallback();
            self.app.middleware.splice(
              ctx.beforeAndCoreMiddlewareNumber
                ? ctx.beforeAndCoreMiddlewareNumber + 1
                : startLength,
              middlewareLength,
              ...middlewares
            );
            middlewareLength = middlewares.length;

            await next();
          } catch (err) {
            error = err;
          }

          if (error) {
            throw error;
          }
        };
      };

      // 整理核心中间件之前的中间件
      const beforeCoreMiddlewareCallback = async () => {
        const middlewares: any = [];
        await nodePlugin.hooks.beforeCoreMiddlewares({
          middlewares,
          config: this.config.toJS(),
          dev: this.dev,
          port: this.port
        });
        this.beforeCoreMiddlewares.forEach((middleware: any) => {
          if (typeof middleware === 'function') {
            middlewares.push(middleware);
          } else {
            if (typeof middleware === 'string') {
              this.loadMiddleware(middleware, middlewares);
            } else if (Array.isArray(middleware)) {
              middleware.forEach(item => {
                this.loadMiddleware(item, middlewares);
              });
            }
          }
        });
        return middlewares;
      };

      // 整理核心中间件之后的中间件
      const afterCoreMiddlewareCallback = async () => {
        const middlewares: any = [];
        await nodePlugin.hooks.afterCoreMiddlewares({
          middlewares,
          config: this.config.toJS(),
          dev: this.dev,
          port: this.port
        });
        this.afterCoreMiddlewares.forEach((middleware: any) => {
          if (typeof middleware === 'function') {
            middlewares.push(middleware);
          } else {
            if (typeof middleware === 'string') {
              this.loadMiddleware(middleware, middlewares);
            } else if (Array.isArray(middleware)) {
              middleware.forEach(item => {
                this.loadMiddleware(item, middlewares);
              });
            }
          }
        });
        return middlewares;
      };

      /**
       * 开始整合中间件
       *
       * 1. 整合核心中间件之前的中间件
       * 2. 整合核心中间件之后的中间件
       * 3. 全部整合到middlewares上
       */
      /* before */
      const beforeCoreMiddlewares = await beforeCoreMiddlewareCallback();
      if (this.dev) {
        // 热更新中间件 + 所有before
        const beforeStartLength = this.app.middleware.length + 1;
        beforeCoreMiddlewares.unshift(
          hmrBeforeMiddleware(
            beforeCoreMiddlewareCallback,
            beforeStartLength,
            beforeCoreMiddlewares.length
          )
        );
      }
      this.middlewares.unshift(...beforeCoreMiddlewares);

      /** 创建路由api中间件 */
      this.createRouter();

      /* core */
      this.loadCoreMiddlewares();

      /** after */
      const afterCoreMiddlewares = await afterCoreMiddlewareCallback();
      if (this.dev) {
        // 热更新中间件 + 所有after
        const afterStartLength = this.app.middleware.length + this.middlewares.length + 1;
        afterCoreMiddlewares.unshift(
          hmrAfterMiddleware(
            afterCoreMiddlewareCallback,
            afterStartLength,
            afterCoreMiddlewares.length
          )
        );
      }
      this.middlewares.push(...afterCoreMiddlewares);

      /** 开始注册所有中间件到app上 */
      this.loadAllMiddlewares();

      return this.createServer(cb);
    } catch (error) {
      console.error(error);
      process.exit(-1);
    }
  }

  public loadCoreMiddlewares() {
    this.registerMiddlewares();
    if (!this.apiServer) {
      const config = this.config.toObject() as IConfig;
      const { app } = config;
      const result: any = app(this.coreMiddlewares);
      if (result && _.isArray(result)) {
        this.coreMiddlewares = result;
      }
      this.coreMiddlewares.forEach(item => {
        // 直接是async函数，那就直接插入中间件
        if (item.constructor.name === 'AsyncFunction') {
          this.middlewares.push(item);
        }
        // 如果是普通函数，传入config和app，供调用运行，并返回async的中间件函数
        if (item.constructor.name === 'Function') {
          this.middlewares.push((item as any)(this.app, config));
        }
      });
    }
  }

  /**
   * 初始化服务端数据，开发环境被重写
   */
  public async init() {
    await resource.call(this);
  }

  /**
   * 加载自定义中间件，开发环境被重写
   *
   * 返回当前加载中间件的路径
   */
  public loadMiddleware(middlewarePath: string, middlewares: Array<any>) {
    let NewPath = middlewarePath;
    if (!new RegExp('^' + this.dir).test(middlewarePath)) {
      NewPath = path.join(this.dir, middlewarePath);
    }
    if (!fs.existsSync(NewPath)) {
      throw new Error(`中间件path：${middlewarePath}相当于当前目录不存在`);
    }

    const middleware = require(NewPath);
    const result = middleware.default || middleware;
    // 支持路径返回数组形式的中间件
    if (Array.isArray(result)) {
      middlewares.push(...result);
    } else {
      middlewares.push(result);
    }
    return NewPath;
  }

  /**
   * 开始创建listen，开发环境被重写
   */
  public async createServer(cb: callback | null = null) {
    const { listen, url }: any = await this.createListen();
    if (cb) {
      cb(listen, url, () => null);
    }
  }

  /**
   * 开始创建监听
   */
  public createListen() {
    return new Promise(async resolve => {
      Loadable.preloadAll().then(() => {
        const cb = (listen: any) => {
          const url = serverInfo.call(this, !this.dev);
          resolve({
            listen,
            url
          });
        };
        if (this.port === '443') {
          const httpsListen = https
            .createServer(this.httpsOptions, this.app.callback())
            .listen(443, () => {
              cb(httpsListen);
            });
        } else {
          const httpListen = this.app.listen(this.port, () => {
            cb(httpListen);
          });
        }
      });
    });
  }

  /**
   * 创建路由中间件
   */
  public createRouter(remove?: Function) {
    if (this.routerRoot && this.routerFile) {
      const self = this;
      const startCreateRouter = () => {
        const router = new Router();
        let routerFile = this.routerFile;
        if (this.routerFile.indexOf(this.routerRoot) === -1) {
          routerFile = path.join(this.routerRoot, routerFile);
        }
        if (typeof remove === 'function' && this.dev) {
          remove(routerFile);
        }
        const routes = require(routerFile);
        const controllerFile = path.join(this.routerRoot, 'controller');
        if (fs.existsSync(controllerFile)) {
          let Controllers = {};
          const collect = (baseFile: string, _Controllers: any) => {
            fs.readdirSync(baseFile).forEach(item => {
              const filePath = path.join(baseFile, item);
              if (fs.statSync(filePath).isDirectory()) {
                _Controllers[item] = {};
                collect(filePath, _Controllers[item]);
              } else {
                if (typeof remove === 'function' && this.dev) {
                  remove(filePath);
                }
                const Controller = require(filePath);
                _Controllers[item.replace(/\.js$/, '')] = new Controller();
              }
            });
          };
          collect(controllerFile, Controllers);
          routes(router, Controllers);
        }
        return router;
      };
      if (typeof remove === 'function' && this.dev) {
        const startLength = this.app.middleware.length + this.middlewares.length + 1;
        this.middlewares.push(async function createServerRoutes(ctx, next) {
          const router = startCreateRouter();
          self.app.middleware.splice(startLength, 1, router.routes() as any);
          self.app.middleware.splice(startLength + 1, 1, router.allowedMethods() as any);
          await next();
        });
      }
      const router: any = startCreateRouter();
      this.middlewares.push(router.routes());
      this.middlewares.push(router.allowedMethods());
    }
  }
}
