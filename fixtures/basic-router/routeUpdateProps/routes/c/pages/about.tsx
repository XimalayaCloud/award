import * as React from 'react';

export default class About extends React.Component<any> {
  public static getInitialProps(ctx: any) {
    (window as any).jestRouterMock && (window as any).jestRouterMock();
    let id = 0;
    ctx.routes.map((item: any) => {
      if (item.match.params.id) {
        id = item.match.params.id;
      }
    });
    return { about: id };
  }

  public render() {
    return (
      <>
        <p>about</p>
        {this.props.children}
      </>
    );
  }
}
