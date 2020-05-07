import { useState } from 'react';
import { start, Consumer, basename } from 'award';
import fetch from 'award-fetch';
import Home from './home';
import About from './about';
import './common.scss!';
import './app.scss';

fetch.interceptors.response.use((response, data, log) => {
  log.error('发生错误了', 'interceptors response');
  console.error(1234, response);
  return data;
});

function app(props) {
  const [info, setInfo] = useState({
    name: 'Award'
  });
  if (process.env.RUN_ENV === 'node') {
    const a = 2;
  }
  return (
    <>
      <p>basename：{basename()}</p>
      <h1
        onClick={() => {
          setInfo(null);
        }}
      >
        Hello {info.name}
      </h1>
      <About />
      <Consumer>
        {award => {
          return <p onClick={props.reloadInitialProps}> 点击试试看: {award.num} </p>;
        }}
      </Consumer>
      <img
        src="//s1.xmcdn.com/css/img/common/album_100.jpg"
        onClick={async () => {
          const data = await fetch({
            url: '/api/upload',
            method: 'POST',
            data: {
              name: 'hello world'
            },
            dataType: 'text'
          });
          alert(data);
        }}
      />
      <Home />
    </>
  );
}

app.getInitialProps = ctx => {
  const result = [
    fetch('/api/list').then(data => {
      ctx.setAward({
        num: data.num
      });
    })
  ];

  return Promise.all(result);
};

function error({ message }) {
  return <p> ErrorMessage: {message} </p>;
}

start(app, error);
