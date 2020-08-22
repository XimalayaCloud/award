import { Context, Next } from 'koa';
import test from 'test';

export default async (ctx: Context, next: Next) => {
  test();
  console.log('test', ctx.path);
  await next();
};
