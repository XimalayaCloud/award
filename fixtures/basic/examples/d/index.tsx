import * as React from 'react';
import { start, ErrorProps } from 'award';

class App extends React.Component<any> {
  public static getInitialProps(ctx: any) {
    if (ctx.query.id) {
      throw { status: 404 };
    }
    return [];
  }

  public render() {
    return (
      <h1
        onClick={() => {
          this.props.reloadInitialProps();
        }}
      >
        hello world
      </h1>
    );
  }
}

class ErrorComponent extends React.Component<ErrorProps> {
  public static async getInitialProps(ctx: any) {
    ctx.loading = () => <p>loading...</p>;
    return {
      name: 'hello error'
    };
  }

  public render() {
    return <p>{this.props.data.name}</p>;
  }
}

start(App, ErrorComponent);
