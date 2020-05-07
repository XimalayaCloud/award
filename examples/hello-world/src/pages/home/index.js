import fetch from 'award-fetch';

<award-style>{`
  p{
    font-size: 20px;
  }
`}</award-style>;

const home = () => {
  return (
    <div>
      <p>home</p>
    </div>
  );
};

home.getInitialProps = ctx => {
  const result = [
    fetch('/api/list').then(data => {
      ctx.setAward({
        num: data.num
      });
    })
  ];

  return Promise.all(result);
};

export default home;
