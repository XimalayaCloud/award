import * as React from 'react';

export default class About extends React.Component {
  public static async getInitialProps(ctx: any) {
    if (ctx.query.id === '1') {
      throw { status: 500 };
    }
  }

  public render() {
    return (
      <div>
        <p>hello about</p>
      </div>
    );
  }
}
