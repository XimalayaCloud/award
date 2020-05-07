import { useState } from 'react';
import { Consumer } from 'award';
import fetch from 'award-fetch';
import { Link } from 'react-router-dom';
import Routes from './routes';
import './app.scss';

function App(props) {
  const [info, setInfo] = useState({ name: 'World' });
  return (
    <>
      <h1
        onClick={() => {
          setInfo(null);
        }}
      >
        Hello {info.name}
      </h1>
      <Consumer>
        {award => {
          return <p onClick={props.reloadInitialProps}>点击这一行试试看: {award.num}</p>;
        }}
      </Consumer>
      <ul>
        <li>
          <Link to="/home">home页面</Link>
        </li>
        <li>
          <Link to="/about/1">about页面 - 1</Link>
        </li>
        <li>
          <Link to="/about/2">about页面 - 2</Link>
        </li>
      </ul>
      <Routes />
    </>
  );
}

App.getInitialProps = ctx => {
  const result = [
    fetch('/api/list').then(data => {
      ctx.setAward({
        num: data.num
      });
    })
  ];

  return Promise.all(result);
};

export default App;
