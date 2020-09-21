import * as React from 'react';
import * as PropTypes from 'prop-types';

/**
 * 定义路由规则
 *
## 示例
```jsx
  <Route
    path="路由规则字符串"
    redirect="重定向的路由地址"
    component={react组件}
    sync="表示当前路由是否同步加载，即当前路由是否需要代码拆分"
    exact={布尔值，表示路由是否是严格匹配}
    loading={react组件，表示当前组件数据加载前展示的loading}
    client={布尔值，表示当前路由对应的组件只在客户端渲染}
    chain={布尔值，表示当前路由的初始化数据是否支持链式传递给下个路由}
  />
```
## Route组件接收如下5种组合的props
**通用字段：`client`、`sync`、`exact`、`loading`*
- `<Route path="" redirect="" />`
- `<Route path="" component={} />`
- `<Route component={} />`
- `<Route redirect="" />`
- `<Route path="" component={} redirect="">`
 */
export default class Route extends React.Component<{
  path?: string;
  component?: React.FC | Function;
  redirect?: string | Function;
  sync?: boolean;
  exact?: boolean;
  loading?: any;
  client?: boolean;
  chain?: boolean;
  /** 支持其他任意的字段 */
  [key: string]: any;
}> {
  public static propTypes = {
    path: PropTypes.string,
    redirect: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
    sync: PropTypes.bool,
    component: PropTypes.any,
    exact: PropTypes.bool,
    loading: PropTypes.any,
    client: PropTypes.bool,
    chain: PropTypes.bool
  };

  public render(): any {
    return null;
  }
}
