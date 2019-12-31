import * as React from 'react';

export default class Home extends React.Component {
  public state = {
    info: {
      age: 1
    }
  };

  public render() {
    return (
      <div>
        <p
          onClick={() => {
            this.setState({
              info: null
            });
          }}
        >
          hello home{this.state.info.age}
        </p>
      </div>
    );
  }
}
