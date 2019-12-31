import * as React from 'react';
import { start } from 'award';
import fetch from 'award-fetch';

class App extends React.Component<any> {
  public static async getInitialProps(ctx: any) {
    const data = await fetch('/api/test');
    return {
      name: data.name
    };
  }

  public render() {
    return (
      <>
        <p>{this.props.name}</p>
      </>
    );
  }
}

start(App);
