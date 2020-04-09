import * as React from 'react';
import { ErrorProps } from 'award';
import { withRouter } from 'react-router-dom';

const ErrorLoading = withRouter((props: any) => {
  return <p>loading...{props.routerError ? 'routerError' : props.location.pathname}</p>;
});
class ErrorComponent extends React.Component<ErrorProps> {
  public static async getInitialProps(ctx: any) {
    if (ctx.error.routerError) {
      ctx.loading = <ErrorLoading />;
    } else {
      ctx.loading = <p>loading...{ctx.pathname}</p>;
    }
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
