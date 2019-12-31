import './home.bak.scss';

class App extends React.Component {
  render() {
    return (
      <h1
        onClick={() => {
          console.log(Math.random());
        }}
      >
        hello world - about.bak
      </h1>
    );
  }
}

export default App;
