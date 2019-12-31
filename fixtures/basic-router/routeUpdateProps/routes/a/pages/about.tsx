import * as React from 'react';

export default class About extends React.Component<any> {
  public static getInitialProps(ctx: any) {
    return {
      id: ctx.match.params.id
    };
  }

  public render() {
    return (
      <div>
        <p>hello about{this.props.id}</p>
      </div>
    );
  }
}
