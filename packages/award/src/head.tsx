import * as React from 'react';
import { Helmet } from 'react-helmet';
import loadParams from 'award-utils/loadParams';

export default (props: any) => {
  const { children, ...rests } = props;
  const { ssr, isSwitchRouter } = loadParams.get();
  if (ssr && !isSwitchRouter) {
    return null;
  }
  return (
    <>
      <Helmet {...rests}>{children}</Helmet>
    </>
  );
};
