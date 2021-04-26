/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
import { useState } from 'react';
import { Consumer } from 'award';
import fetch from 'award-fetch';
import { Link } from 'react-router-dom';
import Routes from './routes';
import './app.scss';

function app(props) {
  const [info, setInfo] = useState({ name: 'Award' });
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
        {(award) => {
          return <p onClick={props.reloadInitialProps}>点击试试看: {award.num}</p>;
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
        <li>
          <Link to="/custom">custom页面</Link>
        </li>
      </ul>
      <Routes />
    </>
  );
}

app.getInitialProps = (ctx) => {
  console.log(ctx.routes);
  const result = [
    fetch('/api/list').then((data) => {
      ctx.setAward({
        num: data.num
      });
    })
  ];

  return Promise.all(result).catch(() => {
    ctx.setAward({
      num: Math.random()
    });
  });
};

app.routerWillUpdate = (to, from, next) => {
  let debugInfo = '';
  let hasDebug = false;
  let toSearch = [];
  if (from && from.location && from.location.search) {
    const search = from.location.search.replace(/^\?/, '');
    search.split('&').map((item) => {
      if (/^LEGO_DEBUG/i.test(item)) {
        debugInfo = item;
      }
    });
  }
  if (to.location.search) {
    const search = to.location.search.replace(/^\?/, '');
    search.split('&').map((item) => {
      if (item !== '') {
        if (/^LEGO_DEBUG/i.test(item)) {
          hasDebug = true;
        } else {
          toSearch.push(item);
        }
      }
    });
  }
  if (hasDebug) {
    next();
  } else {
    let currentSearch = '';
    if (debugInfo) {
      toSearch.push(debugInfo);
      currentSearch = toSearch.join('&');
    }
    next({ pathname: to.location.pathname, search: currentSearch ? '?' + currentSearch : '' });
  }
};

app.routerDidUpdate = () => {
  console.log(1, 'routerDidUpdate');
};

export default app;
