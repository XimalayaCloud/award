import { RouterSwitch, Route } from 'award-router';

import Home from './pages/home';
import About from './pages/about';

export default () => (
  <RouterSwitch>
    <Route path="/home" component={Home} loading={<p>loading...</p>} />
    <Route
      path="/about"
      component={props => (
        <>
          <h3>this is about page</h3>
          {props.children}
        </>
      )}
    >
      <Route path="/about/:id" component={About} client loading={<p>loading...</p>} />
    </Route>
  </RouterSwitch>
);
