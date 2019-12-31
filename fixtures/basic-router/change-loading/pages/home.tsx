import * as React from 'react';

export default class Home extends React.Component<any> {
  public static async getInitialProps() {
    const data = new Promise(resolve => {
      setTimeout(() => {
        resolve('home');
      }, 100);
    });
    return {
      name: data
    };
  }

  public render() {
    return (
      <>
        <p>hello {this.props.name}</p>
      </>
    );
  }
}
