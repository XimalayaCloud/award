import * as React from 'react';
import Routes from './routes/a';

export default class App extends React.Component {
  public render() {
    return (
      <>
        <p>hello routes</p>
        <Routes />
      </>
    );
  }
}
