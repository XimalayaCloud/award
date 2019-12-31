import * as React from 'react';
import { start, Consumer } from 'award';

class App extends React.Component {
  public state = {
    name: '123'
  };

  public render() {
    return (
      <>
        <Consumer>
          {() => {
            return (
              <>
                <p>{this.state.name}</p>
              </>
            );
          }}
        </Consumer>
        <button
          onClick={() => {
            this.setState({
              name: 'abc'
            });
          }}
        >
          {this.state.name}
        </button>
      </>
    );
  }
}

start(App);
