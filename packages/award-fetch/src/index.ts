import isString = require('lodash/isString');
import reduce = require('lodash/reduce');
import { IOpt1, IOptUserBase } from './interfaces/fetchOptions';
import log, { set as _setLog } from './utils/log';
import * as thriftUtils from './utils/thrift'; // 防止开发环境模块重新载入
import { COMMONERROR, ABORTERROR } from './utils/constant';
import { interceptors as _interceptors, clean } from './utils/interceptors';

export interface Log {
  error: (err: Error | string, name: string) => void;
}

const interceptors = {
  request: {
    use: (func: (response: Request, log: Log) => Request) => {
      let sourceFile = null;
      if (process.env.NODE_ENV === 'development' && process.env.RUN_ENV === 'node') {
        try {
          throw new Error();
        } catch (error) {
          const stack = error.stack;
          const stackArr = stack.split('\n');
          const source = stackArr[2];
          const match = source.match(new RegExp(`${process.cwd()}/(.*)(.js|ts|jsx|tsx)`));
          if (match) {
            sourceFile = match[0];
          }
        }
      }
      _interceptors.request.push({
        source: sourceFile,
        func
      });
    }
  },
  response: {
    /**
     * 回调函数支持 async await
     *
     * @data award-fetch处理后的数据结构，比如`json()`、`text()`
     *
     * @response 请求返回的响应的对象原型 Response
     *
     * @log 输出日志，log.error
     */
    use: (func: (data: any, response: Response, log: Log) => Response) => {
      let sourceFile = null;
      if (process.env.NODE_ENV === 'development' && process.env.RUN_ENV === 'node') {
        try {
          throw new Error();
        } catch (error) {
          const stack = error.stack;
          const stackArr = stack.split('\n');
          const source = stackArr[2];
          const match = source.match(new RegExp(`${process.cwd()}/(.*)(.js|ts|jsx|tsx)`));
          if (match) {
            sourceFile = match[0];
          }
        }
      }
      _interceptors.response.push({
        source: sourceFile,
        func
      });
    }
  }
};

/**
 * award统一请求接口函数实现
 * ```
 * import fetch from 'award-fetch'
 *
 * fetch({
 *   url: "/api",
 *   // 劫持单个请求的的response处理
 *   transformResponse: () => {
 *
 *   }
 * })
 * ```
 *
 * ## 请求劫持处理
 *
 * ```
 * // request 表示请求参数
 * // log是函数，可以在服务器输出错误 log.error
 * fetch.interceptors.request.use((request, log) => {
 *  console.log(request);
 *  return request
 * })
 *
 * // 响应劫持处理
 * // data表示award-fetch处理的数据结果
 * // response 表示响应返回的对象原型
 * // log是函数，可以在服务器输出错误 log.error
 * fetch.interceptors.response.use((data, response, log) => {
 *  console.log("response status",response.status);
 *  return data
 * })
 * ```
 *
 * ## 取消fetch，目前仅支持xhr取消
 * ```
 *
 * const source = fetch.source();
 * // 发起上传请求
 * fetch({
 *  url: '/api/upload',
 *  method: 'POST',
 *  xhr: true,
 *  data: fileInfo,
 *  cancelToken: source.token
 * });
 *
 * // 终止上传
 * source.cancel();
 * ```
 */
async function awardFetch(options: string | IOpt1, otherOptions?: IOptUserBase): Promise<any> {
  if (isString(options)) {
    options = {
      url: options
    };
  }
  if (!options.url) {
    return Promise.reject(new Error('url empty'));
  }

  if (otherOptions) {
    Object.assign(options, otherOptions);
  }

  (options as any).basename = awardFetch.basename;

  options = reduce(
    _interceptors.request,
    (req, interceptor): IOpt1 => {
      const result = interceptor.func(req, log);
      if (result) {
        return result;
      } else {
        return req;
      }
    },
    options
  );

  let response = null;
  // 环境判断
  if (process.env.RUN_ENV === 'node') {
    const { thrift } = options;
    if (thrift) {
      response = require('./env/thrift')(options, thriftUtils);
    } else {
      response = require('./env/server')(options);
    }
  } else if (process.env.WEB_TYPE === 'WEB_SPA') {
    // 单页应用开发环境
    if (Number(process.env.Browser) === 1) {
      // 这里走websocket
      response = require('./env/file')(options);
    } else {
      // 这里是web端
      response = require('./env/web')(options);
    }
  } else {
    // 这里是在线的web端
    response = require('./env/web')(options);
  }
  return response;
}

function all(fetches: any) {
  return fetches;
}

const source = () => {
  let cancelResolve: Function;

  return {
    token: {
      promise: new Promise(resolve => {
        cancelResolve = resolve;
      })
    },
    cancel: (msg?: string) => {
      cancelResolve(msg);
    }
  };
};

const setLog = (customLog: { error: Function }) => {
  _setLog(customLog);
};

export { interceptors, all, source, setLog };

awardFetch.interceptors = interceptors;
awardFetch.all = all;
awardFetch.source = source;
awardFetch.setLog = setLog;

// 变量
awardFetch.COMMON_ERROR = COMMONERROR;
awardFetch.ABORT_ERROR = ABORTERROR;

/** 指定是否需要启用当前basename */
awardFetch.basename = false;

awardFetch.clean = clean;

export default awardFetch;
