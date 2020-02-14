import fetch from 'award-fetch';
import './index.scss';

const home = () => {
  return (
    <div>
      <p>home</p>
    </div>
  );
};

home.getInitialProps = ctx => {
  const result = [
    fetch('/api/list').then((data: any) => {
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

export default home;
