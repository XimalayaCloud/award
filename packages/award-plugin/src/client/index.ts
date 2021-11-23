import client, { register } from './client';
import {
  Iinit,
  IrouteChangeBeforeLoadInitialProps,
  ImodifyInitialPropsCtx,
  Irendered,
  IcatchError
} from '../../types/client';

// 在这里定义客户端的插件时机的名称
const basicnames = ['sync mount', 'init', 'modifyInitialPropsCtx', 'rendered', 'catchError'];
const routernames = ['routeChangeBeforeLoadInitialProps'];

const hooks: {
  /** mount挂载dom设置 */
  mount: () => HTMLElement;

  /** 客户端初始化时，触发该方法，此后将不再触发了 */
  init: (params: Iinit) => Promise<any>;
  /** 修改客户端`getInitialProps`函数接收的参数 */
  modifyInitialPropsCtx: (params: ImodifyInitialPropsCtx) => Promise<any>;
  /** 客户端路由发生变化时，在加载数据之前，获取bundle之后触发 */
  routeChangeBeforeLoadInitialProps: (params: IrouteChangeBeforeLoadInitialProps) => Promise<any>;

  /** 在客户端，通过ReactDOM渲染结束后触发的钩子函数，即当前所有的组件都已经触发`componentDidMount`了 */
  rendered: (params: Irendered) => Promise<any>;

  /** 客户端发生错误，捕获后，通过hook进行二次处理 */
  catchError: (params: IcatchError) => Promise<any>;
} = client([...basicnames, ...routernames]);

export default {
  hooks,
  register,
  names: {
    basic: basicnames,
    router: routernames
  }
};
