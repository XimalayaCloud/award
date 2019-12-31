/**
 * 渲染Switch的核心组件
 */
import * as React from 'react';
import ManageRoute from './render/ManageRoute';
import { Route, Switch } from 'react-router-dom';
import SwitchContext from './context';

/**
 * 渲染每个路由组件
 */
const renderRoute = (path: any, childRoutes: any) => {
  return (props: any) => {
    return (
      <SwitchContext.Consumer>
        {(value: any) => {
          return (
            <ManageRoute
              pathname={props.location.pathname}
              consumer={value}
              rest={{ path, childRoutes, props }}
            />
          );
        }}
      </SwitchContext.Consumer>
    );
  };
};

/**
 * 递归渲染出所有的Switch组件
 */
const renderRoutes = (routes: any) => {
  return (
    <Switch>
      {routes.map((route: any, index: any) => {
        // 子路由
        const childRoutes: any = route.routes ? renderRoutes(route.routes) : null;

        return (
          <Route
            key={index}
            path={route.path}
            exact={route.exact}
            strict={route.strict}
            render={renderRoute(route.path, childRoutes)}
          />
        );
      })}
    </Switch>
  );
};

/**
 * 通过shouldComponentUpdate限制，Switch只有第一次注册
 * 后面不再渲染该组件，也不再执行Switch递归
 */
export default class extends React.Component<any> {
  public shouldComponentUpdate() {
    return false;
  }

  public render() {
    return renderRoutes(this.props.routes);
  }
}
