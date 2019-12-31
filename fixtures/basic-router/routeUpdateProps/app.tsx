import * as React from 'react';
import Routes from './routes/a';

export default class App extends React.Component<any> {
  public static getInitialProps() {
    (window as any).jestMock && (window as any).jestMock();
    return {
      name: 'routes'
    };
  }

  public render() {
    return (
      <>
        <p>hello {this.props.name}</p>
        <Routes />
      </>
    );
  }
}
