import * as React from 'react';

export default class About extends React.Component<any> {
  public static async getInitialProps(ctx: any) {
    if (ctx.match.params.id === '1') {
      await new Promise(resolve => {
        setTimeout(resolve, 100);
      });
      throw { url: '/home' };
    }
  }

  public render() {
    return (
      <>
        <p>hello detail</p>
      </>
    );
  }
}
