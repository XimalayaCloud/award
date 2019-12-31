/**
 * 错误处理中间件
 */

import { clearConsole } from '../../tool';
import { IContext, IServer } from 'award-types';
import { Middleware } from 'koa';
import SystemError from '../utils/systemError';

export default function devError(this: IServer): Middleware<any, IContext> {
  return async function devErrorMiddlware(ctx, next) {
    try {
      await next();
    } catch (error) {
      // 开发环境
      if (process.stdout.isTTY) {
        clearConsole();
      }
      ctx.body = SystemError(error);
    }
  };
}
