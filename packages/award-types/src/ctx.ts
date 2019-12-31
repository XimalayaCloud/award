import { ITextObj, IAny } from './util';
import { Request } from 'koa';
import { Route, MatchedRoute } from './routes';
import { match } from 'react-router-dom';

export interface ICtx {
  location?: IAny;
  query: ITextObj;
  req?: Request;
  route: Route | null;
  routes: Array<MatchedRoute<{}>>;
  match?: match<{}> | null;
  setAward: (obj: Object) => void;
}
