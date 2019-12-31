import fetch = require('isomorphic-fetch');
import defaultsDeep = require('lodash/defaultsDeep');
import isString = require('lodash/isString');
import some = require('lodash/some');
import { IOpt1, IOpt2, IOptdefault } from '../interfaces/fetchOptions';
import transformRequest from './transformRequest';
import xhr, { checkStatus } from './xhr';

function parseJSON(response: Response) {
  return checkStatus(response).json();
}

function parseText(response: Response) {
  return checkStatus(response).text();
}

function parseObject(response: Response) {
  let data: any = response;
  try {
    data = JSON.parse(data);
  } catch (error) {
    null;
  }
  return data;
}

function parseXhrJSON(data: Response) {
  let _data = data;
  if (typeof data === 'string') {
    try {
      _data = JSON.parse(data);
    } catch (error) {
      null;
    }
  }
  return _data;
}

const defaultOptions = {
  method: 'get',
  dataType: 'json',
  // 允许跨域
  credentials: 'include',
  mode: 'cors',
  // request data format
  // object --> string
  transformRequest,
  transformResponse: parseJSON,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
  }
};

/**
 * 是否需要xhr（使用了不支持fetch的功能）
 */
function needXHR(opt: IOpt1 | IOpt2) {
  return (
    process.env.RUN_ENV === 'web' &&
    some(
      ['xhr', 'onDownloadProgress', 'onUploadProgress', 'timeout'],
      (v: string) => (opt as any)[v]
    )
  );
}

function mergeOptions(_options: IOpt1, defaultOpt?: IOptdefault): IOpt2 {
  const options: IOpt2 = defaultsDeep(_options, defaultOpt);
  const { method, body, params, data, transformRequest: transform, dataType } = options;

  if (method.toLowerCase() === 'get') {
    // get请求支持数据传递，优先级 params > data > body
    const temp = transform(params || data || body);
    options.params = temp ? `?${temp}` : '';
    delete options.body;
  } else {
    // 非get请求，params get数据
    // body 请求体，优先级 data > body
    const temp = transform(params);
    options.params = temp ? `?${temp}` : '';
    options.body = transform(data || body, dataType);

    if (!isString(options.body)) {
      // 文件等默认识别content-type
      delete options.headers['Content-Type'];
    } else if (dataType === 'json') {
      options.headers['Content-Type'] = 'application/json';
    }
  }

  if (needXHR(options) && dataType === 'json') {
    options.transformResponse = parseXhrJSON;
  }

  if (dataType === 'string' || dataType === 'text') {
    options.transformResponse = parseText;
  }

  if (dataType === 'object') {
    options.transformResponse = parseObject;
  }

  return options;
}

/**
 * web client fetch
 * @param  {[object]} options fetch参数
 */
export default (options: IOpt1) => {
  const opts: IOpt2 = mergeOptions(options, defaultOptions);
  const { url, params, transformResponse } = opts;

  if (needXHR(opts)) {
    return xhr(opts);
  }

  return fetch(`${encodeURI(url)}${params}`, opts)
    .then(checkStatus)
    .then(transformResponse);
};
