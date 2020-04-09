import { MatchedRoute } from 'award-types';

export interface ILifeCycletoFrom {
  match_routes: any;
  location: any;
}

export interface ICtx {
  routes: Array<any>;
  pathname: string;
  query: any;
  lastQuery: any;

  lastTarget: ILifeCycletoFrom;
  _lastTarget: ILifeCycletoFrom;
  lastMatchRoutes: Array<MatchedRoute<{}>>;
  lastRoute: string;

  target: ILifeCycletoFrom;
  targetLocation: {
    pathname: string;
    search: string;
  };
  route: string;
  targetMatchRoutes: Array<MatchedRoute<{}>>;
  targetMatchRoutesLength: any;
  targeDiffRoutes: Array<MatchedRoute<{}>>;

  cb: Function;
}

export interface IKernal {
  routes: Array<any>;
  leavePaths: any;
  lastMatchRoutes: Array<MatchedRoute<{}>>;
  target: ILifeCycletoFrom;
  lastTarget: ILifeCycletoFrom;
  lastRoute: string;
  modal: Function;
  history: any;
  getInitialState: Function;
  setParam: Function;
  emitter: {
    emit: (name: string, data: any) => void;
    exist: Function;
  };
  updateInitialState: Function;
  loadBundles: Function;
  loadInitialProps: Function;
  forceRenderRouter: Function;
  routeIsSwitch: boolean;
  routeChanged: boolean;
  exportPath: any;
  lastQuery: any;
}
