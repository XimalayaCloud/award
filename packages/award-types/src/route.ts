export interface IRoutes {
  routes: Array<any[any]>;
  match_routes: Array<any[any]>;
  location_search: string;
  match_routes_length: number;
  data: Object;
}

export interface IRoute {
  data: Object;
  match_routes: Array<any[any]>;
  location_search: string;
  childRoutes: any;
  Cmt: any;
  path: any;
  match_routes_length: number;
}
