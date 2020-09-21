import * as React from 'react';
import { RouterSwitch, Route } from 'award-router';

import About from './pages/about';
import AboutDetail from './pages/about-detail';

export default class App extends React.Component {
  public render() {
    return (
      <RouterSwitch>
        <Route path="/about" component={About} chain>
          <Route path="/about/:id" component={AboutDetail} chain />
        </Route>
      </RouterSwitch>
    );
  }
}
