import { RouterSwitch, Route } from 'award-router';
import Home from './pages/home';
import About from './pages/about';

export default class Routes extends React.Component {
  render() {
    return (
      <RouterSwitch>
        <Route path="/" component={Home} exact />
        <Route path="/about" component={About} exact />
      </RouterSwitch>
    );
  }
}
