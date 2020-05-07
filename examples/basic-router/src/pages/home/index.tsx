import fetch from 'award-fetch';
import { Link } from 'react-router-dom';
import './index.scss';

const home = () => {
  return (
    <div>
      <p>home</p>
      <li>
        <Link to="/search/%CCCC">ERROR</Link>
      </li>
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
