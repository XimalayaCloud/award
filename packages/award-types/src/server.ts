import * as Koa from 'koa';
import { Seq, List } from 'immutable';
import { IAny } from './util';
import { AComponentType } from './component';

export interface IServerEntry {
  dev?: boolean;
  isMock?: boolean;
  isProxy?: boolean;
  port?: string | number;
  ignore?: boolean;
  apiServer?: boolean;
  devFun?: Function | null;
}

export interface IServer {
  dir: string;
  dev?: boolean;
  isMock?: boolean;
  isProxy?: boolean;
  port: string | number;
  ignore?: boolean;
  apiServer?: boolean;
  middlewares: Koa.Middleware[];
  app: Koa;
  config: Seq.Keyed<string, any>;
  RootPageEntry: string;
  routes: List<any>;
  map: Seq.Keyed<string, any>;
  httpsOptions: IAny;
  favicon: string | Buffer | null;
  manifestFile: string;
  logFilterInfo: any[];
  RootDocumentComponent: AComponentType;
  RootComponent: AComponentType;
  ErrorCatchFunction: Function;
  renderReactToString: Function | null;
}
