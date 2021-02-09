/**
 * 继承核心Server类，添加开发环境处理方案
 */
import * as http from 'http';
import * as https from 'https';
import { List } from 'immutable';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as chalk from 'chalk';
import { renderToString } from 'react-dom/server';
import { Helmet as Head } from 'react-helmet';
import { getBundles } from 'react-loadable/webpack';
import { Server } from 'award-server';
import openBrowser = require('open-chrome-refresh');
import { serverInfo, getAwardConfig } from 'award-utils/server';
import { IServerEntry, IContext } from 'award-types';

import { extensions, clearConsole, constant as toolConstant } from '../tool';
import { register } from '../babel';
import remove = require('../remove');
import { constant } from '../help';

import favicon from './middlewares/favicon';
import MockMiddleware from './middlewares/mock';
import hmrConfig from './middlewares/hmrConfig';
import hmrEntrySource from './middlewares/hmrEntrySource';
import hmrCoreMiddleware from './middlewares/hmrCoreMiddleware';
import devError from './middlewares/error';
import staticProxyMiddleware from './middlewares/staticProxyMiddleware';

import loadEntryFile from './utils/loadEntryFile';

export type callback = (listen: http.Server | https.Server, url: string, open: Function) => void;

const devFun = (isDev: boolean) => {
  if (isDev) {
    return () => {
      const { router } = getAwardConfig();
      process.env.ROUTER = router;
      register();
      clearConsole();
    };
  } else {
    return null;
  }
};

export default class DevServer extends Server {
  public prod = false;
  private removeMiddlewares: Array<string> = [];

  /**
   * DevServer初始化构造函数之参数说明
   *
   * @param isProxy     标识是否启用proxy获取数据
   * @param port        指定当前服务器的端口号
   * @param ignore      忽略显示系统默认错误，仅在开发环境生效，主要用于错误页面开发
   * @param apiServer   标识当前的服务器是否仅仅可以作为一个接口数据代理服务，比如可以当作一个mock服务器或者proxy服务器
   */
  public constructor(params: IServerEntry = {}, prod = false) {
    super({
      ...params,
      isMock: true,
      devFun: devFun(!params.apiServer && !prod),
      dev: prod ? false : true
    });
  }

  public extensions() {
    /**
     * 开启require扩展识别
     */
    extensions();
  }

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
  public async listen(port?: string | number | callback, cb: callback | null = null) {
    if (typeof port === 'string' || typeof port === 'number') {
      (this as any).port = port;
    } else if (typeof port === 'function') {
      cb = port;
    }

    if (!this.apiServer) {
      // 端口冲突处理
      if (typeof cb !== 'function' && this.dev) {
        cb = (_listen: http.Server | https.Server, url: string, open: Function) => {
          open(`http://127.0.0.1:` + this.port);
        };
      }
    }
    this.startListen(cb);
  }

  public async init() {
    const self = this;
    if (this.apiServer) {
      return;
    }

    if (!this.dev) {
      return await super.init();
    }

    /**
     * 在当前服务不仅仅当做api服务时初始化必要的环境
     */
    serverInfo.call(this);
    console.info();
    /**
     * 需等待web编译结束才继续中间件逻辑
     */
    this.app.use(async function awaitWebCompiler(ctx: IContext, next: Function) {
      const done = path.join(self.dir, 'node_modules', 'compiler.done');
      if (!fs.existsSync(done)) {
        await new Promise((resolve) => {
          const time = setInterval(() => {
            if (fs.existsSync(done)) {
              clearInterval(time);
              resolve(undefined);
            }
          }, 100);
        });
      }
      await next();
    });

    /**
     * 对web静态资源做端口代理转发
     */
    this.app.use(staticProxyMiddleware.call(this));

    /**
     * remove中间件
     */
    this.app.use(async function removeMiddleware(ctx: IContext, next: Function) {
      try {
        await next();
      } finally {
        self.removeMiddlewares.forEach((item) => {
          remove(item);
        });
      }
    });

    /**
     * 开发环境注册渲染
     */
    (this as any).renderReactToString = async (Component: any, ctx: IContext) => {
      let stats = null;
      // 加载bundle json
      const filename = path.join(toolConstant.CACHE_DIR, constant['REACT-LOADABEL']);
      if (fs.existsSync(filename)) {
        stats = JSON.parse(fs.readFileSync(filename, 'utf-8'));
      }

      // 渲染组件
      const html = renderToString(Component);
      const bundles = stats ? getBundles(stats, ctx.award.modules) : [];
      const head = Head.renderStatic();
      return {
        html,
        head,
        bundles
      };
    };
  }

  public loadCoreMiddlewares() {
    const beforeLength = this.middlewares.length;

    if (!this.dev) {
      super.loadCoreMiddlewares();
      return this.middlewares.splice(beforeLength + 5, 0, MockMiddleware());
    }

    this.registerMiddlewares();

    /**
     * favicon 开发热更新
     * +0  [1+0]
     */
    this.middlewares.splice(beforeLength + 1, 0, favicon.call(this));

    /**
     * 开发环境错误处理
     * +1  [1+1]
     */
    this.middlewares.splice(beforeLength + 2, 0, devError.call(this));

    /**
     * 服务端热更新 配置 中间件
     * +2  [4+2]
     */
    this.middlewares.splice(beforeLength + 6, 0, hmrConfig.call(this));

    /**
     * mock数据中间件
     * +3  [5+3]
     */
    this.middlewares.splice(beforeLength + 8, 0, MockMiddleware());

    /**
     * 服务端热更新 加载js 中间件
     * +4  [5+4]
     */
    this.middlewares.splice(beforeLength + 9, 0, hmrEntrySource.call(this));

    /**
     * 核心中间件之自定义热更新中间件
     * +5  [6+5]
     */
    this.middlewares.splice(
      beforeLength + 11,
      0,
      ...hmrCoreMiddleware.call(this, List(this.coreMiddlewares))
    );
    return null;
  }

  public loadMiddleware(middlewarePath: string, middlewares: Array<any>) {
    const newPath = super.loadMiddleware(middlewarePath, middlewares);
    this.removeMiddlewares.push(newPath);
    return newPath;
  }

  /**
   * 开始创建listen，开发环境被重写
   */
  public async createServer(cb: callback | null = null) {
    // 开始创建listen
    const result: any = await this.createListen();
    if (cb) {
      result.listen.on('close', () => {
        global.EventEmitter.emit('close_compiler_process');
      });
      cb(result.listen, result.url, openBrowser);
    }
    if (this.dev && !this.apiServer) {
      process.nextTick(() => {
        loadEntryFile.call(this);
      });
    }
  }

  /**
   * 创建服务端接口的路由
   */
  public createRouter() {
    super.createRouter(remove);
  }

  /**
   * hook log
   */
  public log(cb: Function) {
    if (this.dev) {
      console.warn(
        chalk.red(
          `${chalk.yellow('[development]')} 为了表意准确请使用${chalk.green(
            'app.catch'
          )}替换app.log，使用方式一致，未来我们会废除app.log`
        )
      );
    }
    super.log(cb);
  }
}
