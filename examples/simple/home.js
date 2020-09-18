<award-style>{`
  @import './index.scss';
  h1{
    color: $color;
  }
`}</award-style>;

export default () => (
  <h1
    onClick={() => {
      alert('hello world');
    }}
  >
    点击看一看
  </h1>
);
