import * as React from 'react';
import './home.scss';
import './test.css';

import bg from './svg/bgline.svg';
import bg2 from './1.jpg';

export default class Home extends React.Component {
  public render() {
    const v = true;
    return (
      <>
        {v ? (
          <div className="hello world">
            <h1>hello home</h1>
            <i className="xm-icon icon-vip" />
          </div>
        ) : null}
        <i className="iconfont icon-edit" />
        <img src={bg} />
        <img src={bg2} />
      </>
    );
  }
}
