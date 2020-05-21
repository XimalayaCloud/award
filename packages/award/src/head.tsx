import * as React from 'react';
import { Helmet } from 'react-helmet';
import loadParams from 'award-utils/loadParams';

export default (props: any) => {
  const { children, ...rests } = props;
  const { ssr, firstRender } = loadParams.get();
  if (ssr && firstRender) {
    return null;
  }
  return (
    <>
      <Helmet {...rests}>{children}</Helmet>
    </>
  );
};
