import fetch from 'award-fetch';
import '@/src/pages/about/index.scss';
import ting from '@/src/pages/about/ting.png';

const about = (props) => {
  console.log(3);
  return (
    <div>
      <p>about1 --- {props.id}</p>
      <hr />
      <em>{props.num}</em>
      <img src={ting} className="em" />
    </div>
  );
};

about.getInitialProps = async (ctx) => {
  console.log(1);
  let num;
  try {
    const data = await fetch('/api/list');
    num = data.num;
  } catch (error) {
    num = Math.random();
  }
  return {
    id: ctx.match.params.id,
    num
  };
};

export default about;
