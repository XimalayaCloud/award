import { useState } from 'react';
import { start, Consumer, basename, Head } from 'award';
import fetch from 'award-fetch';
import Home from './home';
import About from './about';
import './common.scss!';
import './app.scss';

fetch.interceptors.request.use((request, context, log) => {
  // console.log(2, request, context);
});

let a = 2;

a === 3 ? (a = <h1>123</h1>) : (a = <h1>abc</h1>);

fetch.interceptors.response.use((data, response, log) => {
  if (!response.ok) {
    return { num: Math.random() };
  }
  console.log('[response data]:', data);
  return data;
});

function app(props) {
  const [info, setInfo] = useState({
    name: 'Award'
  });
  if (process.env.RUN_ENV === 'node') {
    const a = 2;
  }
  console.log('render');
  return (
    <>
      <Head>
        <title>basic</title>
        <meta name="keywords" content="award" />
      </Head>
      {a}
      <p>basename：{basename()}</p>
      <h1
        onClick={() => {
          setInfo(null);
        }}
      >
        Hello {info.name}
        <span>12345</span>
      </h1>
      <About />
      <Consumer>
        {(award) => {
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

app.getInitialProps = (ctx) => {
  const result = [
    ctx
      .fetch('/api/list')
      .then(async (data) => {
        ctx.setAward({
          num: data.num
        });
      })
      .catch((e) => {
        console.error(e);
      })
  ];

  return Promise.all(result);
};

function error({ message }) {
  return <p> ErrorMessage: {message} </p>;
}

start(app, error);
