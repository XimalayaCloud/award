import { start } from 'award';

<award-style>{`
  h1{
    color:red;
  }
`}</award-style>;

start(
  <h1
    onClick={() => {
      alert('hello world');
    }}
  >
    点击看一看
  </h1>
);
