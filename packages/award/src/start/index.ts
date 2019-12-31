import * as React from 'react';
import { capture } from 'award-utils/Exception';
import clientPlugin from 'award-plugin/client';
import { AComponentType, Ioptions } from 'award-types';

export interface ErrorProps {
  /**
   * 错误说明
   */
  message: string;
  /**
   * 错误状态码
   */
  status: number;
  /**
   * 当前是否在路由内发生错误
   */
  routerError: boolean;
  stack: any;
  info: any;
  url: any;
  data: any;
}

/**
 *    启动react渲染,只能执行一次，就算后续执行了也不会启任何作用，并且会在控制台进行错误提示
 *    @Component       项目启动入口组件
 *    @ErrorComponent  展示错误的组件
 */
export default function start(
  Component: AComponentType | React.ComponentElement<any, any>,
  ErrorComponent?: React.ComponentClass | React.FC<ErrorProps>,
  // options主要通过babel注入的一些配置信息，目前有plugins
  options: Ioptions = {}
): any {
  let RootComponent = Component;
  if (React.isValidElement(Component)) {
    RootComponent = (props: any) =>
      React.cloneElement(Component, typeof Component.type === 'function' ? { ...props } : {});
  }
  if (ErrorComponent) {
    capture(ErrorComponent);
  }
  if (process.env.RUN_ENV === 'node') {
    // node端，通过react-dom/server进行服务端渲染
    global.AppRegistry(RootComponent);
  } else {
    // 注册插件
    if (options && options.plugins && options.plugins.length) {
      clientPlugin.register(options.plugins);
    }
    // 客户端渲染应用
    let _start: (Component: AComponentType, hot?: Function) => any = require('./web');
    if (process.env.NODE_ENV === 'development') {
      return async (hot: Function) => {
        await _start(RootComponent as AComponentType, hot);
      };
    } else {
      return _start(RootComponent as AComponentType);
    }
  }
}
