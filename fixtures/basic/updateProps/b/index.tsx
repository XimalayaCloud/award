import * as React from 'react';
import { start } from 'award';

class App extends React.Component<any> {
  public static getInitialProps(ctx: any) {
    window.jestMock && window.jestMock();
    return {
      name: 'world' + (ctx.query.id || '')
    };
  }

  public static updateProps = () => {
    window.jestMock && window.jestMock();
    return true;
  };

  public render() {
    return (
      <h1
        onClick={() => {
          this.props.reloadInitialProps();
        }}
      >
        hello {this.props.name}
      </h1>
    );
  }
}

start(App, props => <p>{props.message}</p>);
