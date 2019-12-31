/**
 * 初始化基础变量
 */
import * as React from 'react';
import { History } from 'history';
import { matchRoutes } from 'react-router-config';
import { realPath, pathname, search, emitter, loadParams } from 'award-utils';
import isPlainObject = require('lodash/isPlainObject');
import { ILifeCycletoFrom } from './type';

let exportPath: any = null;

if (process.env.WEB_TYPE === 'WEB_SPA') {
  exportPath = process.env.EXPORTPATH;
}

export default class Base extends React.Component {
  /** 基础数据 */
  public routes: any;
  public match_routes: any;
  public lastMatchRoutes: any;
  public lastRoute: any;
  public lastTarget: ILifeCycletoFrom;
  public target: ILifeCycletoFrom;
  public award_initialState: any;
  public emitter: any;

  /** 数据交互更新 */
  public updateInitialState: Function;
  public getInitialState: Function;
  public updateProps: Function | boolean;
  public getInitialProps: Function;

  /**  其他 */
  public cleanError: Function;
  public forceRenderRouter: Function;
  public history: History;
  public PromptContext: any;
  public scrollParam: any;
  public pathname: any;
  public leavePaths = [];
  public routeIsSwitch = false;
  public routeChanged = false;
  public lastQuery = {};
  public exportPath = null;

  public constructor(...args: any[]) {
    super(args[0], args[1]);
    const [Component, routes, match_routes, INITIAL_STATE] = args[2];
    const { basename } = loadParams.get();
    this.pathname = realPath(basename, pathname());
    const _search = search();

    this.updateProps = Component.updateProps;
    this.getInitialProps = Component.getInitialProps || null;
    this.routes = routes;
    this.match_routes = match_routes;
    this.lastMatchRoutes = match_routes;
    this.lastRoute = this.pathname + _search;
    this.lastTarget = {
      match_routes,
      location: {
        pathname: this.pathname,
        search: _search
      }
    };
    this.target = this.lastTarget;
    this.award_initialState = INITIAL_STATE;
    this.emitter = emitter.getEmitter();

    if (process.env.NODE_ENV === 'development') {
      // 开发存储当前数据供热更新时使用
      window.hmr_initialState = INITIAL_STATE;
    }

    if (process.env.WEB_TYPE === 'WEB_SPA') {
      if (!isPlainObject(exportPath) && typeof exportPath === 'string') {
        try {
          exportPath = JSON.parse(exportPath);
        } catch (error) {}
      }
      if (exportPath) {
        for (let html in exportPath) {
          if (Object.prototype.hasOwnProperty.call(exportPath, html)) {
            const routes: any = matchRoutes(this.routes, exportPath[html]).pop();
            exportPath[html] = routes.match.path;
          }
        }
        this.exportPath = exportPath;
      }
    }
  }
}
