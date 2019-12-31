import {
  init,
  modifyInitialPropsCtx,
  routeChangeBeforeLoadInitialProps,
  rendered,
  catchError
} from '../../types/client';
import Client from './';
import { parseAsync } from '../utils';

export interface BasicHook {
  init: init;
  rendered: rendered;
  modifyInitialPropsCtx: modifyInitialPropsCtx;
  catchError: catchError;
}

export interface RouterHook {
  routeChangeBeforeLoadInitialProps: routeChangeBeforeLoadInitialProps;
}

class Plugin {
  private __plugin__self__hooks__: any;
  private __plugin__name__: string;

  /**
   * 插件动态变量对象
   */
  public options: any = {};

  protected constructor(hooks: any, options: any = {}, name: string) {
    this.__plugin__self__hooks__ = hooks;
    this.__plugin__name__ = name;
    this.options = options;
  }

  private method(callback: Function, methodName: 'basic' | 'router') {
    const self = this;
    const obj: any = {};
    Client.names[methodName].forEach(name => {
      const { name: fnName } = parseAsync(name);
      obj[fnName] = function() {
        self.__plugin__self__hooks__[fnName](...arguments);
      };
    });
    try {
      callback(obj);
    } catch (error) {
      console.error(`[ plugin-name: ${this.__plugin__name__} ] 客户端注册插件时发生错误\n${error}`);
    }
  }

  /**
   * 执行客户端运行阶段的钩子函数
   *
   * `init`
   *
   * `rendered`
   *
   * `modifyInitialPropsCtx`
   *
   * `catchError`
   */
  public basic(callback: (hooks: BasicHook) => void) {
    this.method(callback, 'basic');
  }

  /**
   * 执行客户端路由切换阶段的钩子函数
   *
   * `routeChangeBeforeLoadInitialProps`
   *
   */
  public router(callback: (hooks: RouterHook) => void) {
    this.method(callback, 'router');
  }
}

export default Plugin;
