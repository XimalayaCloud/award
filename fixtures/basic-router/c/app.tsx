import * as React from 'react';
import { RouterSwitch, Route } from 'award-router';
import Home from './pages/home';
import About from './pages/about';

export default class App extends React.Component {
  public state = {
    info: {
      name: 'routes'
    }
  };

  public render() {
    return (
      <>
        <p
          onClick={() => {
            this.setState({
              info: null
            });
          }}
        >
          hello {this.state.info.name}
        </p>
        <RouterSwitch>
          <Route path="/test1" redirect="/home" />
          <Route
            path="/test2"
            redirect={() => {
              return '/about/1';
            }}
          />
          <Route path="/home" component={Home} />
          <Route path="/about/:id" component={About} />
          <Route />
        </RouterSwitch>
      </>
    );
  }
}
