import { start } from 'award';
import Home from './home';

<award-style>{`
  @import './index.scss';
  h1{
    color: $color;
  }
`}</award-style>;

start(
  <>
    <h1
      onClick={() => {
        alert('hello world');
      }}
    >
      点击看一看
    </h1>
    <Home />
  </>
);
