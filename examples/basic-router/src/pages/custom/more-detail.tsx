import * as React from 'react';
import { Link } from 'react-router-dom';

export default class extends React.Component<any> {
  public static getInitialProps(ctx) {
    return {
      id: ctx.match.params.id,
      pid: ctx.match.params.pid
    };
  }

  public render() {
    return (
      <div>
        <Link to="/custom">/custom</Link>
        <div>
          这是更多的详情介绍-{this.props.id} - {this.props.pid}
        </div>
      </div>
    );
  }
}
