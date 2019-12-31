---
id: consumer
title: consumer
sidebar_label: consumer
---

##

```js
import { Consumer } from 'award';

...
// 使用 Consumer 获得全局 store
<Consumer>
  {(store) => {
    console.log('the global store: ', store);
    return <YourComponent />;
  }}
</Consumer>
...

```