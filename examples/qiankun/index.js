import { start } from 'award';

const app = () => {
  return (
    <h1
      onClick={() => {
        alert(123);
      }}
    >
      123
    </h1>
  );
};

export async function bootstrap() {
  console.info('[react16] react app bootstraped');
}

export async function mount(props) {
  console.info('[react16] props from main framework', props);
  start(app);
}

export async function unmount(props) {
  const { container } = props;
  // ReactDOM.unmountComponentAtNode(
  //   container ? container.querySelector('#root') : document.querySelector('#root')
  // );
}
