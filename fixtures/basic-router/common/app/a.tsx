import { history } from 'award-router';
import * as React from 'react';
import Routes from '../routes/a';

export default class App extends React.Component {
  public componentDidMount() {
    (window as any).__history__ = history;
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
