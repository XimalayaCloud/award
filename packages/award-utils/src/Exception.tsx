/* eslint-disable no-param-reassign */
/**
 * 错误处理
 */
import * as React from 'react';
import { IAwardException } from 'award-types';
import hoistNonReactStatics = require('hoist-non-react-statics');
import { pathname as localPathname } from './help';

// 这里是组件
let CaptureComponent: any = null;

// 显示错误的组件
const ErrorComponent: any = (props: any) => {
  if (process.env.NODE_ENV === 'production') {
    return <p>网站奔溃了，请联系网站管理员</p>;
  } else {
    // 没有设置错误组件，返回默认提示
    return (
      <div>
        <style>
          {`
          .errorInfo{
            background-color:#fff;
            padding: 30px;
            font-size: 14px;
            position: fixed;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
          }
          .errorInfo .info{
            padding: 2px 4px;
            font-size: 90%;
            color: #c0341d;
            background-color: #fcedea;
            border-radius: 3px;
          }
          .errorDetail{
            line-height: 36px;
            margin-top: 20px;
          }
          pre{
            background-color: #000;
            color: #fff;
            padding: 10px 20px;
            border-radius: 5px;
            margin-top: 10px;
            height: 20%;
            overflow: auto;
            margin-right: 80px;
          }
          `}
        </style>
        <div className="errorInfo">
          <div className="errorDetail">
            <strong>
              以下内容只有在条件
              <b className="info">process.env.NODE_ENV !== &#39;production&#39;</b>
              成立时显示
            </strong>
          </div>
          <code>
            <pre>
              {`
// 当前错误原因
status: ${props.status},
message: ${props.message},
stack: ${props.stack},
info: ${JSON.stringify(props.info)},
url: ${props.url},
routerError: ${props.routerError},
data: ${JSON.stringify(props.data)},
                `}
            </pre>
          </code>
          <div className="errorDetail">
            <p>
              当前渲染出现错误，请指定<b className="info">错误组件</b>
              对错误进行友好展示
            </p>
          </div>
          <code>
            <pre>
              {`
// 指定错误组件
import { start } from 'award';

// app是根组件
// error是错误组件
// 用来显示当前页面渲染出错时展示的内容
start(app, error);
                `}
            </pre>
          </code>
        </div>
      </div>
    );
  }
};

/**
 * 处理错误说明
 *
 *    error       当前抛出的详情错误内容
 *    this        服务端this对象时ctx
 */
export async function handleError(
  this: any,
  error: IAwardException,
  showLoading: null | Function = null
): Promise<IAwardException> {
  if (process.env.RUN_ENV === 'web') {
    console.error(error);
  }
  const message = error.message ? error.message : null;
  const stack = error.stack ? error.stack : null;
  const { status = 500, info = {}, url = null, routerError = true, pathname, ...rests } = error;
  error = { ...rests, status, message, stack, info, url, routerError, data: {} };

  const ctx: any = {
    error,
    req: this,
    loading: null,
    pathname: process.env.RUN_ENV === 'web' ? localPathname() : pathname
  };

  Object.defineProperty(ctx, 'loading', {
    set(value) {
      if (showLoading) {
        showLoading(value);
      }
      this.val = value;
    },
    get() {
      return this.val;
    }
  });

  if (CaptureComponent) {
    if (CaptureComponent.getInitialProps) {
      error.data = await CaptureComponent.getInitialProps(ctx);
    }
  }

  return error;
}

export const capture = (Component: any) => {
  // 高阶组件包裹didcatch
  CaptureComponent = class extends React.Component<any, any> {
    public constructor(props: any) {
      super(props);
      this.state = {
        error: null
      };
    }

    public componentDidCatch(error: any) {
      // 错误页面渲染出现错误
      const message = error.message ? error.message : null;
      this.setState({ error: { message } });
    }

    public render() {
      if (this.state.error) {
        return <ErrorComponent {...this.state.error} />;
      }
      if (React.isValidElement(Component)) {
        return React.cloneElement(Component, { ...this.props });
      }
      return <Component {...this.props} />;
    }
  };

  hoistNonReactStatics(CaptureComponent, Component);
};

export const shot = () => CaptureComponent || ErrorComponent;

export default {
  // 处理错误信息
  capture,
  handleError,
  shot
};
