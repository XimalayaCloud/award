import { IContext } from 'award-types';
import { Exception } from 'award-utils';
import { render } from 'award-render';

export default async function PageError(
  errorInfo: any,
  ctx: IContext,
  react_render: Function | null
) {
  // 页面语法错误,定位到错误页面
  const { status = 500, url = null } = errorInfo;

  ctx.status = status;

  if (url != null) {
    // 抛出重定向
    console.info('[redirect]', url);
    ctx.status = status === 301 ? status : 302;
    if (!/^http(s)?:/.test(url)) {
      ctx.redirect(ctx.award.config.basename + url);
    } else {
      ctx.redirect(url);
    }
    return '';
  } else {
    // 抛出错误
    ctx.award.initialState.AwardException = await Exception.handleError.call(
      { req: ctx.request },
      {
        ...errorInfo,
        message: errorInfo.message ? errorInfo.message : null,
        stack: errorInfo.stack ? errorInfo.stack : null,
        routerError: ctx.award.routerError,
        pathname: ctx.path
      }
    );
    return render(ctx, react_render);
  }
}
