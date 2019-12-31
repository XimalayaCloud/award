import * as React from 'react';
import { Consumer } from 'award';

export default class About extends React.Component<any> {
  public static async getInitialProps(ctx: any) {
    const data = new Promise(resolve => {
      setTimeout(() => {
        ctx.setAward({ name: ctx.match.params.id });
        resolve('hello');
      }, 100);
    });
    return {
      age: '123',
      name: data
    };
  }

  public render() {
    return (
      <>
        <p>age:{this.props.age}</p>
        <p>name:{this.props.name}</p>
        <Consumer>
          {(award: any) => {
            return <p>hello {award.name}</p>;
          }}
        </Consumer>
      </>
    );
  }
}
