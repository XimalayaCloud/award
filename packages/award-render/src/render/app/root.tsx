import * as React from 'react';
import { withRouter } from 'react-router-dom';
import { Exception } from 'award-utils';
import { IContext } from 'award-types';

export default (ctx: IContext) => {
  let RootComponent: any = () => null;

  /**
   * mode区分 server 服务端渲染、前后端分离应用
   *         client 客户端渲染、单页面应用
   */
  const { mode } = ctx.award.config;

  if (mode === 'server') {
    if (ctx.award.error && !ctx.award.routerError) {
      // 发生错误，且是路由外的错误
      const Component = Exception.shot();
      const redirect = (url: string, status?: number) => {
        ctx.status = status === 301 ? status : 302;
        if (!/^http(s)?:/.test(url)) {
          ctx.redirect(ctx.award.config.basename + url);
        } else {
          ctx.redirect(url);
        }
      };
      RootComponent = () => (
        <Component {...(ctx.award.initialState.AwardException || {})} redirect={redirect} />
      );
    } else {
      // 存在路由，渲染正常组件
      const Component = withRouter(ctx.award.RootComponent as React.FC);
      RootComponent = () => <Component {...(ctx.award.initialState.award || {})} />;
    }
  }
  return RootComponent;
};
