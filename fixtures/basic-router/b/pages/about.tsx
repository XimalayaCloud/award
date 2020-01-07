import * as React from 'react';

const Confirm = (props: any) => (
  <>
    <em onClick={props.pass}>同意</em>
    <em onClick={props.stop}>拒绝</em>
  </>
);

export default class About extends React.Component<any> {
  public static getInitialProps(ctx: any) {
    return {
      id: ctx.match.params.id,
      qid: ctx.query.id
    };
  }

  public static routeWillLeave(to: any, from: any, next: any) {
    console.log('routeWillLeave');
    (window as any).jestMock && (window as any).jestMock();
    if (from.query.id === '1' && to.query.id === '2') {
      // 从query id 为1 跳转 query id为2时，针对性测试
      next(<Confirm />);
    } else if (from.query.id === '2' && to.query.id === '3') {
      // 测试warning
      next(<p>同意</p>);
    } else if (from.query.id === '2' && to.query.id === '4') {
      // 测试warning
      next('/about/4');
    } else if (from.location.pathname === '/about/4' && to.query.id == '4') {
      next(true);
    } else if (from.query.id === '4' && to.query.id === '5') {
      // 测试warning
      next(false);
    } else if (from.query.id === '4' && to.query.id === '6') {
      // 测试object
      next({ pathname: '/about/6' });
    } else if (from.location.pathname === '/about/6' && to.query.id === '7') {
      // 测试object replace
      next({ pathname: '/about/1', replace: true });
    } else if (from.location.pathname === '/about/1' && to.query.id === '8') {
      // 测试function no
      next(() => {});
    } else {
      next();
    }
  }

  public static routeDidUpdate(to: any, from: any, data: any) {
    console.warn(to.location.pathname);
    console.warn(to.location.search);
    if (arguments.length === 3) {
      (window as any).routeDidUpdateArgs && (window as any).routeDidUpdateArgs();
    }
    console.log('routeDidUpdate');
    (window as any).jestMock && (window as any).jestMock();
  }

  public render() {
    return (
      <div>
        <p>
          hello about{this.props.id}
          {this.props.qid}
        </p>
      </div>
    );
  }
}
