import Loadable from 'react-loadable';
import Routes from './routes';

const LoadableComponent = Loadable({
  loader: () => import('./app.bak'),
  loading: () => <b>加载中...</b>,
  delay: 3000
});

import './app.scss';

class App extends React.Component {
  render() {
    return (
      <div>
        <h1
          onClick={() => {
            console.log(Math.random());
          }}
        >
          hello world - app
        </h1>
        <LoadableComponent />
        <p>---------------</p>
        <Routes />
        <p>---------------</p>
      </div>
    );
  }
}

export default App;
