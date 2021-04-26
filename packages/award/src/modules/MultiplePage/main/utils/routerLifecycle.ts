import { realPath, loadParams, emitter, pathname } from 'award-utils';
import isRender from './render';
/**
 * 存储
 * routerWillUpdate
 * routerDidUpdate
 */
let _routerWillUpdate: Function | null = null;
let _routerDidUpdate: Function | null = null;

/**
 * 存储静态方法
 */
const setWillUpdate = (Component: any) => {
  if (Component.routerWillUpdate && typeof Component.routerWillUpdate === 'function') {
    _routerWillUpdate = Component.routerWillUpdate;
  }
};

const setDidUpdate = (Component: any) => {
  if (Component.routerDidUpdate && typeof Component.routerDidUpdate === 'function') {
    _routerDidUpdate = Component.routerDidUpdate;
  }
};

interface IRouteInfo {
  match_routes: Array<any>;
  location: any;
}

/**
 * 路由切换前钩子说明
 *
 * to 表示目标路由对象
 *
 *  from 表示来源，如果没有来源，比如非服务端渲染，刷新页面首次进入，默认为null
 *
 * 如果to和from都有意义，那么两者的数据结构是一致的
 *
 * history 表示react-router的跳转形式
 *
 * to和from数据格式
 *
 * 使用方式
 *
 * ```js
 *  // award核心调用
 *  await routerWillUpdate({ to, from, history, data })
 *
 *  // 开发者使用
 *  // 根组件定义静态方法
 *  static routerWillUpdate(to, from, next, data){
 *  // 只有执行next才会进行下一步路由切换的动作
 *    next()
 *  }
 *  ```
 */
export function routerWillUpdate({
  to,
  from = null,
  history,
  data = null
}: {
  to: IRouteInfo;
  from: any;
  history: any;
  data: any;
}) {
  let status = false;
  return new Promise((r) => {
    const resolve = (v: any) => {
      if (!status) {
        status = true;
        r(v);
      }
    };
    if (_routerWillUpdate) {
      _routerWillUpdate(
        to,
        from,
        (value: any) => {
          if (!status) {
            if (typeof value !== 'undefined') {
              if (typeof value === 'boolean') {
                resolve(value);
              } else {
                // 执行history跳转
                const { firstRender, ssr } = loadParams.get();
                let push = false;
                let nexLocation: any = {};
                if (typeof value === 'string') {
                  nexLocation = {
                    pathname: value
                  };
                } else if (typeof value === 'object') {
                  const { replace = false, ...rest } = value;
                  push = replace;
                  nexLocation = rest;
                } else {
                  console.warn('next函数接收的类型不正确');
                  return resolve(false);
                }
                nexLocation.search = nexLocation.search || '';
                if (firstRender) {
                  if (!ssr) {
                    // 非服务端渲染，在客户端执行首次渲染触发routerWillUpdate
                    // 这个时候需要注册history跳转的监听，同时说明，需要跳转
                    // 所以，需要先渲染出路由组件，然后再执行history跳转
                    isRender.set(false);
                    emitter.getEmitter().on('routerWillUpdate_!ssr', (newhistory: any) => {
                      isRender.set(true);
                      const method = push ? newhistory.push : newhistory.replace;
                      method(nexLocation);
                    });
                  }
                  resolve(true);
                } else {
                  const targetLocationInfo = to.location.pathname + to.location.search;
                  const nextLocationInfo = nexLocation.pathname + nexLocation.search;
                  const method = push ? history.push : history.replace;
                  const { basename } = loadParams.get();
                  const currentLocationInfo = realPath(basename, pathname());
                  if (
                    targetLocationInfo !== nextLocationInfo &&
                    targetLocationInfo !== currentLocationInfo
                  ) {
                    resolve(false);
                    method(nexLocation);
                  } else {
                    resolve(true);
                  }
                }
              }
            } else {
              resolve(true);
            }
          }
        },
        data
      );
    } else {
      resolve(true);
    }
  }).then((res) => {
    if (res && !loadParams.get().firstRender) {
      loadParams.set({ isSwitchRouter: true });
    }
    return res;
  });
}

routerWillUpdate.set = setWillUpdate;

export function routerDidUpdate({ to, from, data }: any) {
  if (_routerDidUpdate) {
    _routerDidUpdate(to, from, data);
  }
}

routerDidUpdate.set = setDidUpdate;

export default {
  routerWillUpdate,
  routerDidUpdate
};
