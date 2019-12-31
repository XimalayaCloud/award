import { history } from 'award-router';
import * as React from 'react';
import Routes from '../routes/b';

export default class App extends React.Component {
  public componentDidMount() {
    (window as any).__history__ = history;
  }

  public static getInitialProps(ctx: any) {
    if (ctx.query.id === '1') {
      throw { message: 'error test' };
    }
  }

  public static routerWillUpdate(to: any, from: any, next: any, data: any) {
    next(() => {});
  }

  public render() {
    return (
      <>
        <p>hello routes</p>
        <Routes />
      </>
    );
  }
}
