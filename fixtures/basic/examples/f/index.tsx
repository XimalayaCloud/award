import * as React from 'react';
import { start, ErrorProps } from 'award';

class App extends React.Component<any> {
  // @ts-ignore
  public render(): any {
    // @ts-ignore
    throw 'error';
  }
}

class ErrorComponent extends React.Component<ErrorProps> {
  public static async getInitialProps(ctx: any) {
    ctx.loading = 'loading';
    return {
      name: 'hello error'
    };
  }

  public render() {
    return <p>{this.props.data.name}</p>;
  }
}

start(App, ErrorComponent);
