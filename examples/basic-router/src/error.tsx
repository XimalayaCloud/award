import { Link } from 'react-router-dom';

export default function error(props) {
  let link = null;
  if (!props.routerError) {
    // 只有全局错误发生时，才会有redirect这个props，方便开发者可以进行重定向跳转
    props.redirect('/');
    return null;
  } else {
    link = <Link to="/">跳转首页</Link>;
  }
  return (
    <>
      <p
        onClick={() => {
          console.log(Math.random());
        }}
      >
        ErrorMessage: {props.message}
      </p>
      {link}
    </>
  );
}
