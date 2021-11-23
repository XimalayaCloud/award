import { start } from 'award';

import './index.scss';

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

/**
 * 请使用乾坤加载
 *
 * ```
 * import { loadMicroApp } from 'qiankun';
 *
 * loadMicroApp(
 *  {
 *    name: 'award',
 *    entry: "Local地址 http://localhost:1234",
 *    container: ref.current
 *  },
 *  {
 *   sandbox: {
 *     experimentalStyleIsolation: true
 *    }
 *  }
 * );
 *
 * ```
 */
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
