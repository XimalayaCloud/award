import fetch from 'award-fetch';
import './index.scss';
import ting from './ting.png';

const about = props => {
  return (
    <div>
      <p>about --- {props.id}</p>
      <hr />
      <em>{props.num}</em>
      <img src={ting} />
    </div>
  );
};

about.getInitialProps = async ctx => {
  const data = await fetch('/api/list');
  return {
    id: ctx.match.params.id,
    num: data.num
  };
};

export default about;
