import * as React from 'react';
import { Helmet } from 'react-helmet';
import loadParams from 'award-utils/loadParams';

export default (props: any) => {
  const { children, ...rests } = props;
  const { ssr, isSwitchRouter, firstRender, routes } = loadParams.get();
  if (ssr) {
    if (routes.length) {
      // 当前页面存在路由
      if (!isSwitchRouter) {
        return null;
      }
    } else {
      // 当前页面不存在路由
      if (firstRender) {
        return null;
      }
    }
  }
  return (
    <>
      <Helmet {...rests}>{children}</Helmet>
    </>
  );
};
