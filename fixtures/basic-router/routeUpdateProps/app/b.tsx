import * as React from 'react';
import Routes from '../routes/b';

export default class App extends React.Component<any> {
  public static getInitialProps(ctx: any) {
    if (ctx.query.id === '123') {
      throw { status: 500 };
    }
    (window as any).jestMock && (window as any).jestMock();
    const data: any = {
      name: 'routes'
    };
    if (ctx.query.id === 'abc') {
      data['reloadInitialProps'] = {};
    }
    return data;
  }

  public static updateProps = (data: any) => {
    if (data.location) {
      if (data.location.pathname === '/about/2') {
        return false;
      }

      if (data.location.pathname === '/about/3') {
        return true;
      }
    }
    (window as any).jestMock && (window as any).jestMock();
    return true;
  };

  public render() {
    return (
      <>
        <p
          onClick={() => {
            this.props.reloadInitialProps();
          }}
        >
          hello {this.props.name}
        </p>
        <Routes />
      </>
    );
  }
}
