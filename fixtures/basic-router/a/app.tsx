import * as React from 'react';
import { RouterSwitch, Route } from 'award-router';
import Home from './pages/home';
import About from './pages/about';

export default class App extends React.Component {
  public render() {
    return (
      <>
        <p>hello routes</p>
        <RouterSwitch>
          <Route path="/home" component={Home} />
          <Route path="/about/:id" component={About} />
        </RouterSwitch>
      </>
    );
  }
}
