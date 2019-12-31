import Loadable from 'react-loadable';

const LoadableComponent = Loadable({
  loader: () => import('./home.bak'),
  loading: () => <em>加载中...</em>,
  delay: 3000
});

import './index.scss';

class Home extends React.Component {
  render() {
    return (
      <div>
        <h1
          onClick={() => {
            console.log(Math.random());
          }}
        >
          hello world - home
        </h1>
        <LoadableComponent />
      </div>
    );
  }
}

export default Home;
