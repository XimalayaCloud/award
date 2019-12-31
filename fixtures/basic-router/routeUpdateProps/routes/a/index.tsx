import * as React from 'react';
import { RouterSwitch, Route } from 'award-router';
import Home from './pages/home';
import About from './pages/about';
import Detail from './pages/detail';

export default class App extends React.Component {
  public render() {
    return (
      <RouterSwitch>
        <Route path="/home" component={Home} />
        <Route path="/about/:id" component={About} />
        <Route path="/detail/:id" component={Detail} client loading={() => <p>loading...</p>} />
      </RouterSwitch>
    );
  }
}
