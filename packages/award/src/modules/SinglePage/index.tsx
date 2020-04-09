/**
 * 无路由单页应用
 */
import * as React from 'react';
import { IinitState, AComponentType } from 'award-types';
import Exception from 'award-utils/Exception';
import clientPlugin from 'award-plugin/client';
import loadParams from 'award-utils/loadParams';
import load from './load';

module.exports = async (Component: AComponentType<any>, INITIAL_STATE: IinitState) => {
  let pass = true;
  // webpack会删除该段代码
  if (process.env.NODE_ENV === 'development') {
    if (window.award_hmr) {
      pass = false;
    }
  }

  if (pass) {
    // 执行初始化插件
    await clientPlugin.hooks.init({
      Component,
      INITIAL_STATE,
      match_routes: []
    });
  }

  const { ssr } = loadParams.get();

  // 仅客户端渲染时加载数据
  if (!ssr && pass) {
    await load(Component, INITIAL_STATE);
  }

  return class AwardApp extends React.Component<any, { errorInfo: any; loading: any; data: any }> {
    private reload = false;

    public constructor(props: any) {
      super(props);
      let errorInfo = null;
      if (process.env.NODE_ENV === 'development') {
        if (window.award_hmr && window.award_hmr_error) {
          // 热更新
          errorInfo = window.award_hmr_error;
        }
      }

      if (!errorInfo) {
        // 正常渲染
        errorInfo = INITIAL_STATE.AwardException || null;
      }
      this.state = {
        errorInfo,
        loading: null,
        data: INITIAL_STATE.award
      };
    }

    public async componentDidCatch(error: any) {
      clientPlugin.hooks.catchError({ type: 'global', error });
      const message = error.message ? error.message : null;
      const stack = error.stack ? error.stack : null;
      const errorInfo = await Exception.handleError.call(
        null,
        {
          message,
          stack,
          routerError: false
        },
        (component: typeof React.Component) => {
          this.setState({
            loading: component
          });
        }
      );
      if (process.env.NODE_ENV === 'development') {
        window.award_hmr_error = errorInfo;
      }
      this.setState({
        errorInfo,
        loading: null
      });
    }

    public async componentDidMount() {
      // 根据配置再加载数据更新节点
      let updateProps = false;
      if (typeof Component.updateProps === 'boolean') {
        updateProps = Component.updateProps;
      } else if (typeof Component.updateProps === 'function') {
        updateProps = await Component.updateProps({ ...INITIAL_STATE });
      }
      if (updateProps) {
        await load(Component, INITIAL_STATE);
        this.setState({
          errorInfo: INITIAL_STATE.AwardException || null,
          data: INITIAL_STATE.award
        });
      }
    }

    public render() {
      this.reload = false;
      if (this.state.loading) {
        const { loading } = this.state;
        if (React.isValidElement(loading)) {
          return React.cloneElement(loading, { ...this.props });
        }
        if (typeof loading === 'function') {
          return React.createElement(loading, { ...this.props });
        }
        return null;
      }

      if (this.state.errorInfo) {
        const ErrorComponent = Exception.shot();
        const redirect = (url: string) => {
          if (!/^http(s)?:/.test(url)) {
            const { basename } = loadParams.get();
            window.location.href = basename + url;
          } else {
            window.location.href = url;
          }
        };
        return <ErrorComponent {...this.state.errorInfo} redirect={redirect} />;
      }
      if (this.state.data.hasOwnProperty('reloadInitialProps')) {
        throw new Error('reloadInitialProps这是系统关键字，请不要使用该名称作为key');
      }
      const reloadInitialProps = async () => {
        if (!this.reload) {
          this.reload = true;
          await load(Component, INITIAL_STATE);
          this.setState({
            errorInfo: INITIAL_STATE.AwardException || null,
            data: INITIAL_STATE.award
          });
        } else {
          console.warn('当前根组件正在执行reloadInitialProps函数，请等待执行完毕！');
        }
      };
      return <Component {...this.state.data} reloadInitialProps={reloadInitialProps} />;
    }
  };
};
