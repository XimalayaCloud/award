import { Context, Next } from 'koa';

export default async (ctx: Context, next: Next) => {
  console.log('test', ctx.path);
  await next();
};
