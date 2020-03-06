/**
 * 默认参数
 */
export interface IOptdefault {
  method: string;
  dataType: string;
  credentials: string;
  mode: string;
  transformRequest: Function;
  transformResponse: Function;
  headers: any;
}

export interface IOptbase {
  xhr?: any;
  onDownloadProgress?: (data: ProgressEvent) => void;
  onUploadProgress?: Function;
  cancelToken?: {
    promise: Promise<unknown>;
  };
  timeout?: string | number;
  data?: object | string;
  withCredentials?: boolean;
  headers?: any;
}

/**
 * 数据转换后
 */
export interface IOpt2 extends IOptbase {
  url: string;
  method: string;
  body?: any;
  params?: string;
  data?: object | string;
  transformRequest: Function;
  transformResponse: (data: Response) => void;
  dataType: string;
  credentials: RequestCredentials;
  mode: RequestMode;
}

/**
 * award-fetch
 */
// 参数二
export interface IOptUserBase extends IOptbase {
  method?: 'GET' | 'POST' | 'DELETE' | 'OPTIONS' | 'HEAD' | 'PUT' | 'CONNECT' | 'PATCH' | 'TRACE';
  body?: object | string;
  params?: object | string;
  transformRequest?: Function;
  transformResponse?: (response: Response) => void;
  dataType?: string;
  credentials?: string;
  mode?: string;
  thrift?: string;
  thriftMethod?: string;
  thriftRequestModel?: string;
}

// 参数一
export interface IOpt1 extends IOptUserBase {
  url: string;
}

export interface IOptthrift extends IOpt1 {
  thrift: string;
  thriftMethod: string;
  thriftRequestModel: string;
}
