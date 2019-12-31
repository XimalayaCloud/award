import * as React from 'react';
import { ErrorProps } from 'award';

class ErrorComponent extends React.Component<ErrorProps> {
  public static async getInitialProps(ctx: any) {
    ctx.loading = () => <p>loading...</p>;
    await new Promise(resolve => {
      setTimeout(() => {
        resolve();
      }, 300);
    });
    return {
      name: 'getInitialProps'
    };
  }

  public render() {
    return <p>hello error{this.props.data.name}</p>;
  }
}

export default ErrorComponent;
