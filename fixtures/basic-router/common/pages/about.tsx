import * as React from 'react';

export default class About extends React.Component {
  public static async getInitialProps(ctx: any) {
    if (ctx.query.id === '1') {
      console.log('await----');
      await new Promise(resolve => {
        setTimeout(resolve, 2000);
      });
    }
  }

  public static routeWillLeave(to: any, from: any, next: any) {
    console.log('routeWillLeave', from.location.pathname, to.location.pathname);
    if (from.location.pathname === '/about/3' && to.location.pathname === '/about/2') {
      console.warn('back');
      return next();
    }

    if (from.location.pathname === '/about/2' && to.location.pathname === '/about/1') {
      console.warn('stop');
      return next(false);
    }

    next();
  }

  public render() {
    return (
      <div>
        <p>hello about</p>
      </div>
    );
  }
}
