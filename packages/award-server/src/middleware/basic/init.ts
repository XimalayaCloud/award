/**
 * 初始化中间件
 */
import { IContext, IServer } from 'award-types';
import { log } from 'award-utils/server';
import { Middleware } from 'koa';
import * as _ from 'lodash';
import pageError from '../../utils/page_error';

export default function(this: IServer, version: string): Middleware<any, IContext> {
  const self = this;
  return async function BasicInitMiddleware(ctx: IContext, next: any) {
    try {
      const url = ctx.request.url;

      // 定义X-Powered-By
      ctx.set('X-Powered-By', `award ${version}`);

      if (url === '/healthcheck') {
        // 健康检查
        console.info(`${new Date()}: ___healthcheck`);
        ctx.body = 'healthCheck success';
      } else if (url === '/favicon.ico') {
        ctx.status = 200;
        if (self.favicon) {
          ctx.type = 'jpg';
          ctx.body = self.favicon;
        } else {
          ctx.body = '';
        }
      } else {
        await next();
      }
    } catch (err) {
      const addErrorHeader = (errorH: any) => {
        try {
          ctx.set(
            'X-Award-Error',
            Buffer.from(_.isError(errorH) ? errorH.message : JSON.stringify(errorH)).toString(
              'base64'
            )
          );
        } catch (error) {
          ctx.set('X-Award-Error', 'errorInfo format error');
        }
      };

      // node服务器发生错误
      const finish = (finishError: any) => {
        addErrorHeader(finishError);
        if (self.dev && !self.ignore) {
          // 系统默认页面
          throw finishError;
        } else {
          // 默认提示文字，主要不能导致服务一直pendding
          ctx.body = `<html><head><meta charset="utf-8"/><title>${ctx.status}</title><body><p>${ctx.status}</p></body></head></html>`;
        }
      };

      // 封装下context下的log
      const contextLog = (info: any, type: any) => {
        return log(info, type, {
          url: ctx.path,
          userAgent: ctx.request.headers['user-agent'],
          referer: ctx.request.headers.referer,
          host: ctx.host
        });
      };

      addErrorHeader(err);

      /**
       * 错误处理, 优先接收 err.status, 比如处理404
       */
      ctx.status = err.status || 500;
      self.ErrorCatchFunction(contextLog(err, 'node'));
      if (self.dev && !self.ignore) {
        // 如果没有设置忽略，将展示系统默认错误页面
        throw err;
      }
      if (!ctx.award) {
        // 即解析层就发生错误了
        return finish(err);
      }

      try {
        // 渲染提供的错误组件页面
        if (self.routes.size !== 0) {
          // 存在路由，强制将错误塞到RouterSwitch组件内
          if (typeof err.routerError === 'boolean' && err.routerError === false) {
            ctx.award.routerError = false;
          } else {
            ctx.award.routerError = true;
          }
        } else {
          // 当前项目没有路由，那么就是false了
          ctx.award.routerError = false;
        }
        ctx.award.error = true;
        ctx.body = await pageError(err, ctx, self.renderReactToString);
      } catch (error) {
        addErrorHeader(error);
        // 渲染错误页面时出现了错误
        if (self.dev && !self.ignore) {
          // 如果没有设置忽略，将展示系统默认错误页面
          throw error;
        }

        ctx.status = 500;
        let newError = error;
        try {
          if (ctx.award.routerError) {
            // 渲染错误定位到Layout层面，这个时候渲染全局展示的错误页面
            self.ErrorCatchFunction(contextLog(newError, 'renderLayout'));
            // 路由内错误在渲染错误页面时，全局报错，这个时候需要直接渲染错误页面
            ctx.award.routerError = false;
            ctx.body = await pageError(error, ctx, self.renderReactToString);
            return;
          }
        } catch (error) {
          newError = error;
        }

        // 错误展示页面确实发生错误了
        self.ErrorCatchFunction(contextLog(newError, 'renderErrorPage'));
        return finish(newError);
      }
    }
  };
}
