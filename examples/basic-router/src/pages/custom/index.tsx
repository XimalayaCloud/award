import * as React from 'react';
import { Link } from 'react-router-dom';

<award-style>{`
@import "./font/index.scss";
  div{
    span{
      background:url('@/src/pages/about/ting.png');
      width:120px;
      height:120px;
      float: left;
      background-size: 100%;
    }
  }
  i{
    font-size:30px;
  }
`}</award-style>;

export default class extends React.Component {
  public render() {
    return (
      <>
        <i className="xm-icon icon-vip" />
        <div>
          <span />
          <Link to="/custom/1">/custom/1</Link>
          <br />
          <Link to="/custom/2">/custom/2</Link>
          <br />
          <Link to="/custom/3">/custom/3</Link>
          <br />
          <Link to="/custom/4">/custom/4</Link>
          <br />
          <Link to="/custom/5">/custom/5</Link>
          <br />
          <Link to="/custom/6">/custom/6</Link>
          <br />
        </div>
      </>
    );
  }
}
