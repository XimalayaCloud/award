/**
 * Server初始化构造函数之参数说明
 *
 * 开发         `node server.js dev`
 *
 * 编译后生产运行 `node server.js`
 *
 * 开发环境内置mock处理
 * @param isProxy     默认`false`，标识是否启用proxy获取数据
 * @param port        默认`1234`，指定当前服务器的端口号
 * @param ignore      默认`false`，忽略显示系统默认错误，仅在开发环境生效，主要用于错误页面开发
 */
declare module 'award/server' {
  import * as Koa from 'koa';
  import * as https from 'https';
  import * as http from 'http';
  import { IContext } from 'award-types';

  class Server {
    /**
     * Server初始化构造函数之参数说明
     *
     * 开发环境内置mock处理
     *
     * @param isProxy     默认`false`，标识是否启用proxy获取数据
     * @param port        默认`1234`，指定当前服务器的端口号
     * @param ignore      默认`false`，忽略显示系统默认错误，仅在开发环境生效，主要用于错误页面开发
     */
    constructor({ isProxy, port, ignore }: { isProxy: boolean; port: Number; ignore: boolean });

    /**
     * 中间件
     ```
     // 这种引用，不会热更新，需要重启服务
      app.use(async (ctx, next) => {
        console.log('start', ctx.request.path);
        await next();
      });

      // 当use引用相对地址文件，或者数组的时候，开发模式会对中间件热更新
      app.use('./middleware');
      app.use(['./middleware']);
     ```
     */
    use(middleware: Koa.Middleware<any, IContext>): void;

    /**
     * 加载核心中间件
     *
     * 用来区分前置中间件和后置中间件

     ```js
      // 设置前置中间件
      app.use();

      // 执行内置核心中间件
      app.core();

      // 设置后置中间件
      app.use();
     ```
     */
    core(): void;

    /**
     * 日志过滤器，仅在生产环境生效
     *
     * 通过过滤器，过滤出需要打印的日志
     *
     * 最后一个参数是option对象，表示该过滤的关键词是否需要打印出来
     *
     * 设置为false，就不会打印出来，默认是true
      ```
      app.logFilter('show', 'test', {
        test: false
      });
      ```
     */
    logFilter(): void;

    /**
     *
     * 开发者可以根据node产生的错误进行自定义过滤出来
     *
     * 回调参数的error对象数据仅生产环境生效
     *
     * 如果没有将errLogs返回，那么将不会打印错误日志
     *
     * ```
     * app.catch((errLogs, ctx) => {
     *   // 开发阶段、errLogs为null
     *   // 可以自行处理errLogs，决定是否将错误errLogs发送到终端，即打印日志
     *   // ctx表示当前发生错误的请求的上下文对象
     *   return newErrLogs;
     * })
     * ```
     *
     */
    catch(cb: (error: object, ctx: IContext) => object): void;

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
    listen(
      port?: string | number | ((listen: http.Server | https.Server, url: string) => void),
      cb?: ((listen: http.Server | https.Server, url: string) => void) | null
    ): Promise<void>;

    /**
     * 指定当前根目录__dirname、路由文件地址./routes.js
     *
     * 这个函数主要用来让开发者自定义api接口，内置了koa-router和koa-body
     *
     ```js
     // routes.js
     module.exports = (router, controller) => {
        // router的使用规则参考koa-router
        router.get('/api/list',controller.index.list);
     }

     // controller.index.list 表示当前root目录下的controller文件夹内的index.js文件
     // index.js
     module.exports = class {
        list(ctx){
          ctx.body = 'hello api/list'
        }
     }
     ```
     */
    router(root: string, routerFile: string): void;
  }

  export = Server;
}
