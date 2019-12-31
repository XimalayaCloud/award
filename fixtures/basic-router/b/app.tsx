import * as React from 'react';
import { RouterSwitch, Route, history } from 'award-router';
import Home from './pages/home';
import About from './pages/about';

export default class App extends React.Component {
  public static routerWillUpdate(to: any, from: any, next: any) {
    const pathname = to.location.pathname;
    if (pathname === '/about') {
      next('/about/1');
    } else if (pathname === '/') {
      next({ pathname: '/home' });
    } else {
      next();
    }
  }

  public static routerDidUpdate(to: any, from: any, data: any) {
    console.log('routerDidUpdate');
    (window as any).jestMock && (window as any).jestMock();
  }

  public componentDidMount() {
    (window as any).__history__ = history;
  }

  public render() {
    return (
      <>
        <p onClick={() => history.push('/about/13?id=14')}>hello routes</p>
        <RouterSwitch>
          <Route path="/test1" redirect="/about/1" exact />
          <Route
            path="/test2"
            redirect={() => {
              return '/about/2';
            }}
            exact
          />
          <Route path="/home" component={Home} exact />
          <Route path="/about/:id" component={About} />
        </RouterSwitch>
      </>
    );
  }
}
