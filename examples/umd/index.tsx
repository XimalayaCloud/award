import * as React from 'react';
import $ from './1.jpg';

import './index.scss';

const Test = React.lazy(() => import('./test'));

export default () => (
  <>
    <h1>hello world</h1>
    <img src={$} />
    <React.Suspense fallback={<p>加载中...</p>}>
      <Test />
    </React.Suspense>
  </>
);
