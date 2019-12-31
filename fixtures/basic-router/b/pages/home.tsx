import * as React from 'react';

export default class Home extends React.Component {
  public static routeWillLeave(to: any, form: any, next: any) {
    (window as any).jestMock && (window as any).jestMock();
    next();
  }

  public render() {
    return (
      <div>
        <p>hello home</p>
      </div>
    );
  }
}
