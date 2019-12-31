/**
 * 过渡中间件，主要为了一些判断处理，不做任何逻辑
 */
export default async function TransitionMiddleware(ctx: any, next: any) {
  await next();
}
