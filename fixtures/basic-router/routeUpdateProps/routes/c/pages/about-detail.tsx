import * as React from 'react';

export default class Home extends React.Component<any> {
  public static getInitialProps(ctx: any, lastData: any) {
    (window as any).jestRouterMock && (window as any).jestRouterMock();
    return lastData;
  }

  public render() {
    return (
      <>
        <p>about-detail-{this.props.about}</p>
      </>
    );
  }
}
