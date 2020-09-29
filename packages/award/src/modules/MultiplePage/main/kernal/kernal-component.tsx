/* eslint-disable react/jsx-no-useless-fragment */
/**
 * 几个核心组件
 * provider
 * router
 * prompt
 * root
 */
import * as React from 'react';
import { BrowserRouter, HashRouter, Prompt, withRouter } from 'react-router-dom';
import { RouteComponentProps } from 'react-router';
import { History, Action, Location } from 'history';
import { search, AwardRouterContext, loadParams, awardHistory } from 'award-utils';

import Lifecycle from './lifecycle';
import isRender from '../utils/render';
import loadRoot from '../utils/fetch-root';

export default class KernalComponent extends Lifecycle {
  /**
   * 该Provider只提供初始化组件时的数据传递，该组件状态将不再更新
   *
   * 把客户端入口整理的数据，通过context传递给路由RouterSwitch组件使用
   * 同理，服务端也有类似的组件
   */
  public provider() {
    const value: any = {
      routes: this.routes,
      match_routes: this.match_routes,
      award_initialState: this.award_initialState,
      location_search: search(),
      pathname: this.pathname,
      updateProps: this.updateProps,
      updateInitialState: (cb: Function) => {
        this.updateInitialState = cb;
      },
      getInitialState: (cb: Function) => {
        this.getInitialState = cb;
      },
      getHistory: (history: History) => {
        awardHistory.storeHistory(history);
        this.history = history;
      },
      forceRenderRouter: (cb: Function) => {
        this.forceRenderRouter = cb;
      },
      isRender: () => {
        return isRender.get();
      }
    };
    if (process.env.NODE_ENV === 'development') {
      // 开发环境热更新数据使用
      value.syncInitialState = (award_initialState: any) => {
        window.hmr_initialState = award_initialState;
      };
    }
    return (props: any) => (
      <AwardRouterContext.Provider value={value}>{props.children}</AwardRouterContext.Provider>
    );
  }

  /**
   * 提供路由的Router渲染，根据配置，选择history还是hash类型的路由
   */
  public router() {
    const Router: typeof React.Component =
      process.env.ROUTER === 'hash' ? HashRouter : BrowserRouter;
    const { basename } = loadParams.get();
    const getUserConfirmation = this.getUserConfirmation.bind(this);
    // 由于Router组件的children必须是组件，所有用fragment包裹一下
    return (props: any) => (
      <Router basename={basename} getUserConfirmation={getUserConfirmation}>
        <>{props.children}</>
      </Router>
    );
  }

  /**
   * 所有的路由组件切换生命周期钩子，都是依赖Prompt组件
   * 再配合Router上的getUserConfirmation钩子，实现了路由切换的逻辑处理
   */
  public prompt() {
    const self = this;
    class PromptModal extends React.Component {
      public state = {
        dom: null
      };

      public componentDidMount() {
        self.PromptContext = this;
      }

      public render() {
        return <>{this.state.dom}</>;
      }
    }
    function message(location: Location, action?: Action) {
      return JSON.stringify({
        location,
        action
      });
    }
    return () => (
      <>
        <PromptModal />
        <Prompt message={message} />
      </>
    );
  }

  /**
   * 根组件之高阶组件
   *
   * 提供全局错误处理
   * 回到顶部
   */
  public root(): any {
    const self = this;
    class AwardRoot extends React.Component<RouteComponentProps<any>, any> {
      private reload = false;

      public constructor(props: RouteComponentProps<any>) {
        super(props);
        this.state = {
          data: self.award_initialState.award
        };
      }

      public async componentDidMount() {
        let updateProps = false;
        if (typeof self.updateProps === 'boolean') {
          updateProps = self.updateProps;
        } else if (typeof self.updateProps === 'function') {
          updateProps = await self.updateProps({ ...self.award_initialState });
        }
        if (updateProps) {
          await loadRoot(self.getInitialProps, self.award_initialState, self.routes);
          this.setState({
            data: self.award_initialState.award
          });
        }
      }

      public getSnapshotBeforeUpdate(prevProps: RouteComponentProps<any>) {
        if (this.props.location !== prevProps.location && self.scrollParam) {
          const { x, y, scroll } = self.scrollParam;
          if (scroll) {
            // 异步滚动
            setTimeout(() => {
              window.scrollTo(x, y);
            }, 0);
          }
        }
        return null;
      }

      public componentDidUpdate() {
        return null;
      }

      public render() {
        this.reload = false;
        if (this.state.data.hasOwnProperty('reloadInitialProps')) {
          throw new Error('reloadInitialProps这是系统关键字，请不要使用该名称作为key');
        }
        const reloadInitialProps = async () => {
          if (!this.reload) {
            this.reload = true;
            await loadRoot(self.getInitialProps, self.award_initialState, self.routes);
            this.setState({
              errorInfo: self.award_initialState.AwardException || null,
              data: self.award_initialState.award
            });
          } else {
            console.warn('当前根组件正在执行reloadInitialProps函数，请等待执行完毕！');
          }
        };
        return (
          <>
            <AwardRouterContext.Consumer>
              {({ getHistory }: any) => {
                getHistory(this.props.history);
                return null;
              }}
            </AwardRouterContext.Consumer>
            {React.cloneElement(this.props.children as React.ReactElement, {
              match: this.props.match,
              location: this.props.location,
              history: this.props.history,
              ...this.state.data,
              reloadInitialProps
            })}
          </>
        );
      }
    }

    return withRouter(AwardRoot);
  }
}
