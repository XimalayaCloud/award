import Loadable from 'react-loadable';

const LoadableComponent = Loadable({
  loader: () => import('./home.bak'),
  loading: () => {
    console.log('loading。。。');
    return <em>加载中...</em>;
  },
  delay: 3000
});

import './index.scss';

class Home extends React.Component {
  static getInitialProps() {
    return {
      test: Math.random()
    };
  }

  render() {
    return (
      <div>
        <h1
          onClick={() => {
            console.log(Math.random());
          }}
        >
          hello world - about - {this.props.test}
        </h1>
        <LoadableComponent />
      </div>
    );
  }
}

export default Home;
