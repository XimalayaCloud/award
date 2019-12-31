import * as React from 'react';
import { Head, start } from 'award';
import Home from './src/home';

import bg from './src/1.jpg';

import './common/index.scss';
import './common/font.scss!';

interface IProps {
  name: string;
}

/**
 * ⚠️ 如果样式和Head同时使用时，需要通过es-style标签来指定样式资源虚拟存储的位置
 */
class App extends React.Component<IProps> {
  public static getInitialProps() {
    return {
      name: 'with style images'
    };
  }

  public render() {
    return (
      <div>
        <Head>
          <title>{this.props.name}</title>
        </Head>
        <i />
        <b />
        <em />
        <h1>{this.props.name}</h1>
        <img src={bg} />
        <Home />
      </div>
    );
  }
}

start(App);
