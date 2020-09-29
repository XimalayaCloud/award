/**
 * 实现服务端渲染的koa中间件
 */
import { IContext, IServer } from 'award-types';
import { render } from 'award-render';
import { Middleware } from 'koa';

/** 根据接口数据、匹配组件渲染出html render */
export default function (this: IServer): Middleware<any, IContext> {
  const self = this;
  return async function RenderMiddleware(ctx: IContext, next: any) {
    // 必须匹配到，才能执行组件渲染
    ctx.award.html = await render(ctx, self.renderReactToString);
    await next();
  };
}
