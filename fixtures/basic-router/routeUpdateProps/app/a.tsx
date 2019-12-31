import * as React from 'react';
import Routes from '../routes/a';
import { Route, RouterSwitch } from 'award-router';

export default class App extends React.Component<any> {
  public static getInitialProps() {
    return {
      name: 'routes'
    };
  }

  public static updateProps = true;

  public render() {
    return (
      <>
        <p>hello {this.props.name}</p>
        <Route />
        <RouterSwitch />
        <Routes />
      </>
    );
  }
}
