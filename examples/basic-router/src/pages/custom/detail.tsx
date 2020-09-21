import * as React from 'react';

export default class extends React.Component<any> {
  public static getInitialProps(ctx, last) {
    console.log('last1', last);
    return {
      info: {
        id: ctx.match.params.id
      }
    };
  }

  public render() {
    return (
      <div>
        hello world - {this.props.info.id}
        {this.props.children}
      </div>
    );
  }
}
