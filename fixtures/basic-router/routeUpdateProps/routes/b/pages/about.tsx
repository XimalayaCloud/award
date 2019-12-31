import * as React from 'react';

export default class About extends React.Component<any> {
  public static getInitialProps(ctx: any) {
    (window as any).jestRouterMock && (window as any).jestRouterMock();
    const data: any = {};
    if (ctx.match.params.id === '1') {
      data['reloadInitialProps'] = null;
    }
    return data;
  }

  public render() {
    return (
      <>
        <p
          onClick={() => {
            (window as any).jestRouterMock && (window as any).jestRouterMock();
            // 重新加载数据
            this.props.reloadInitialProps();
          }}
        >
          hello about
        </p>
      </>
    );
  }
}
