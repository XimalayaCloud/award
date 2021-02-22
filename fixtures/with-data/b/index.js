import * as React from 'react';
import { start } from 'award';
import fetch from 'award-fetch';

class App extends React.Component {
  static async getInitialProps(ctx) {
    const data = await fetch('/api/list');
    return {
      name: data.name
    };
  }

  render() {
    return <p>{this.props.name}</p>;
  }
}

start(App);
