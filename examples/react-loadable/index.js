import { start } from 'award';
import { Link } from 'react-router-dom';
import Loadable from 'react-loadable';

const LoadableComponent = Loadable({
  loader: () => import('./app'),
  loading: () => <p>加载中...</p>,
  delay: 3000
});

start(() => (
  <div>
    <h1>header...</h1>
    <Link to="/">home</Link>
    <br />
    <Link to="/about">about</Link>
    <LoadableComponent />
    <footer>footer...</footer>
  </div>
));
