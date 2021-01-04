import * as React from 'react';
import {
  unmountsetState,
  Exception,
  emitter,
  setAward,
  routeComponents,
  loadParams,
  queryObj
} from 'award-utils';
import clientPlugin from 'award-plugin/client';
import fetch from 'award-fetch';

const isObj = (obj: any) => typeof obj === 'object';
const isPromise = (obj: any) =>
  !!obj && (typeof obj === 'object' || typeof obj === 'function') && typeof obj.then === 'function';

/**
 * 处理路由的核心组件
 */
@unmountsetState
export default class AsyncRender extends React.Component<
  {
    routes: Array<any>;
    router: any;
    path: any;
    url: any;
    data: any;
    hasRender: any;
    updateError: any;
    updateState: any;
    routerDidUpdate: any;
    updateProps: any;
  },
  any
> {
  public fetchTime = 0;
  private path = null;
  private emitter: any;
  private reload = false;

  public constructor(props: any) {
    super(props);
    this.path = props.path;
    this.state = {
      loading: true,
      [props.data.match.url + props.data.location.search]: props.data
    };
  }

  // 同步更新history相关的location等信息
  public static getDerivedStateFromProps(props: any, state: any) {
    const key = props.data.match.url + props.data.location.search;
    const removes = ['history', 'location', 'match', 'staticContext'];
    const rests: { [key: string]: any } = {};
    const stateData = state[key] || {};
    for (let rest in stateData) {
      if (removes.indexOf(rest) === -1) {
        rests[rest] = stateData[rest];
      }
    }
    return {
      [key]: { ...props.data, ...rests }
    };
  }

  public async componentDidMount() {
    this.emitter = emitter.getEmitter();
    const { needInitiProps } = this.props.router.route;
    const { firstRender, ssr } = loadParams.get();
    let updateProps = false;
    if (firstRender) {
      // 首次渲染，判断是否需要更新当前路由组件数据
      if (typeof this.props.updateProps === 'boolean') {
        updateProps = this.props.updateProps;
      } else if (typeof this.props.updateProps === 'function') {
        updateProps = await this.props.updateProps({ ...this.renderdata() });
      }

      if (updateProps) {
        this.fetchData();
      }
    }
    if (firstRender && ssr) {
      if (!updateProps) {
        this.routerDidUpdate();
      }
    } else {
      // 首次加载触发didMount 刷新页面
      if (!needInitiProps) {
        // 加载数据
        this.fetchData();
      } else {
        this.routerDidUpdate();
      }
    }

    // 路由切换，需要获取数据
    this.emitter.on(this.path, (isNeedInitiProps: boolean) => {
      if (!isNeedInitiProps) {
        // 加载数据
        this.fetchData();
      } else {
        // 切换前已经加载了
        this.routerDidUpdate();
      }
    });
  }

  public componentWillUnmount() {
    // 销毁监听器
    this.emitter.off(this.path);
  }

  private renderdata() {
    const pathname = this.props.data.match.url;
    const search = this.props.data.location.search;
    const data = {
      ...this.props.data,
      ...(this.state[pathname + search] || {})
    };
    if (data.hasOwnProperty('reloadInitialProps')) {
      throw new Error('reloadInitialProps这是系统关键字，请不要使用该名称作为key');
    }
    data.reloadInitialProps = () => {
      if (!this.reload) {
        this.reload = true;
        this.fetchData();
      } else {
        console.warn('当前路由组件正在执行reloadInitialProps函数，请等待执行完毕！');
      }
    };
    return data;
  }

  private routerDidUpdate() {
    const Component = routeComponents.get(this.path);
    this.props.routerDidUpdate(Component ? Component.routeDidUpdate : null, this.renderdata());
    this.reload = false;
  }

  private renderLoading() {
    const LoadingComponent = this.props.router.route.loading || null;
    if (LoadingComponent) {
      if (React.isValidElement(LoadingComponent)) {
        return LoadingComponent;
      }
      if (typeof LoadingComponent === 'function') {
        return <LoadingComponent />;
      }
    }
    return null;
  }

  public render() {
    const LoadingComponent = this.props.router.route.loading || null;
    const { children } = this.props;
    const Component = routeComponents.get(this.path);

    if (!Component) {
      console.warn('组件未找到');
      return null;
    }

    const { firstRender } = loadParams.get();

    if (this.props.router.route.client && firstRender) {
      // 这里的逻辑仅服务端渲染时才会触发
      return this.renderLoading();
    }

    const data = this.renderdata();

    // 如果当前路由需要优先获取数据，那么现在就可以直接渲染该路由了
    if (this.props.router.route.needInitiProps || !Component.getInitialProps) {
      return <Component {...data}>{children}</Component>;
    } else {
      // 没有优先获取数据，如果存在loading组件，则渲染loading，否则渲染当前组件
      // 同时当前路由没有渲染出数据过
      if (LoadingComponent && this.state.loading && !this.props.hasRender) {
        return this.renderLoading();
      }

      return <Component {...data}>{children}</Component>;
    }
  }

  private async fetchData() {
    const { getInitialProps } = routeComponents.get(this.path);

    if (!getInitialProps) {
      if (this.state.loading) {
        this.setState({ loading: false });
      }
      return setTimeout(() => {
        this.routerDidUpdate();
      }, 0);
    }

    const url = this.props.url;

    // 用来判断是否是当前操作的数据加载
    this.fetchTime++;
    const fetchTime = this.fetchTime;

    // 渲染loading
    if (!this.state.loading) {
      if (!this.props.hasRender) {
        this.setState({
          loading: true
        });
      }
    }

    try {
      // 执行getInitialProps函数
      const renderProps = this.props.data;
      const initalProps = {
        history: renderProps.history,
        location: renderProps.location,
        routes: this.props.routes,
        match: renderProps.match,
        query: queryObj(renderProps.location.search.replace(/^\?/, '')),
        setAward: setAward.get(),
        fetch
      };
      await clientPlugin.hooks.modifyInitialPropsCtx({
        params: initalProps
      });
      const data = await getInitialProps(initalProps);

      // 没有返回值或者返回值不是对象
      if (!data || !isObj(data) || Array.isArray(data)) {
        this.props.updateState(url, {});

        return this.setState({ loading: false }, () => {
          this.routerDidUpdate();
        });
      }

      // 如果getInitialProps返回了promise则分多次渲染，否则一次性渲染
      // 重新排序，非promise的优先渲染
      let hasPromise = false;
      let hasObject = false;
      const returnPromise: any = {};
      const returnObject: any = {};
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const item = (data as any)[key];
          if (isPromise(item)) {
            hasPromise = true;
            returnPromise[key] = item;
          } else {
            hasObject = true;
            returnObject[key] = item;
          }
        }
      }

      // 渲染Object数据
      if (hasObject) {
        if (fetchTime !== this.fetchTime) {
          return;
        }
        // 渲染数据
        const pathname = this.props.data.match.url;
        const search = this.props.data.location.search;
        this.setState(
          {
            [pathname + search]: {
              ...(this.state[pathname] || {}),
              ...returnObject
            },
            loading: false
          },
          () => {
            // 存储数据
            this.props.updateState(url, returnObject);
          }
        );
      }

      // 渲染Promise数据
      if (hasPromise) {
        for (const key in returnPromise) {
          if (returnPromise.hasOwnProperty(key)) {
            if (fetchTime !== this.fetchTime) {
              return;
            }
            const _data = await (returnPromise as any)[key];
            // 渲染数据
            const pathname = this.props.data.match.url;
            const search = this.props.data.location.search;
            this.setState({
              [pathname + search]: {
                ...(this.state[pathname] || {}),
                [key]: _data
              },
              loading: false
            });

            // 存储数据
            this.props.updateState(url, {
              [key]: _data
            });
          }
        }
      }

      return setTimeout(() => {
        this.routerDidUpdate();
      }, 0);
    } catch (error) {
      clientPlugin.hooks.catchError({ type: 'fetch', error });
      setTimeout(() => {
        this.routerDidUpdate();
      }, 0);
      const errorInfo = await Exception.handleError.call(null, error);
      this.props.updateError(errorInfo);
    }
  }
}

/* note:

1. fetchTime: 用于防止点击太快导致的 数据切换问题

如果用户快速从 A 页面切换到 B 再切换到 A, 再切换到 B, 那么可能上一次 B 还没加载完, 这里直接采用新的 B 的加载流程, 放弃之前老 B 的流程的数据, 只做一次 setState

2. 嵌套路由问题: 切换页面会直接 emit path 上的函数
*/
