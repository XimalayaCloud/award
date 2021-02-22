import * as React from 'react';
import { start, ErrorProps } from 'award';

class App extends React.Component<any> {
  public state = {
    info: {
      age: { test: '10' }
    }
  };

  public render() {
    return (
      <h1
        onClick={() => {
          this.setState({
            info: null
          });
        }}
      >
        {this.state.info.age.test}
      </h1>
    );
  }
}

class ErrorComponent extends React.Component<ErrorProps> {
  public static async getInitialProps(ctx: any) {
    ctx.loading = <p>loading...</p>;
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
    return {
      name: 'hello error'
    };
  }

  public render() {
    return <p>{this.props.data.name}</p>;
  }
}

const Main = () => <App name="hello" />;

start(Main, ErrorComponent);
