import * as React from 'react';
import { RouterSwitch, Route } from 'award-router';
import { Link } from 'react-router-dom';
import Home from './pages/home';
import About from './pages/about';

export default class App extends React.Component {
  public render() {
    return (
      <>
        <Link to="/about/1">/about/1</Link>
        <Link to="/about/2">/about/2</Link>
        <Link to="/home">/home</Link>
        <RouterSwitch>
          <Route path="/home" component={Home} loading={<p>loading...home</p>} />
          <Route path="/about/:id" component={About} loading={() => <p>loading...about</p>} />
        </RouterSwitch>
      </>
    );
  }
}
