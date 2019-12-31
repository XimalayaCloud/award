export interface Imodel {
  reducers: any;
  effects: any;
  state: any;
  namespace: string;
  initPage?: Function | undefined;
  _handleInitPage?: boolean;
}

export interface Model {
  namespace: string;
  state?: any;
  reducers?: object;
  effects?: object;
  subscriptions?: object;
}
