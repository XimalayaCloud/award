/* eslint-disable no-param-reassign */
import isString = require('lodash/isString');
import reduce = require('lodash/reduce');
import { IOpt1 } from './interfaces/fetchOptions';
import { set as _setLog } from './utils/log';
import * as thriftUtils from './utils/thrift'; // 防止开发环境模块重新载入
import { COMMONERROR, ABORTERROR } from './utils/constant';

// fetch 拦截器
const _interceptors: {
  request: Function[];
  response: Function[];
} = {
  request: [],
  response: []
};

/**
 * Requests a URL, returning a promise.
 * @param  {object} [options] The options we want to pass to "fetch"
 * @param  {object} [otherOptions] 保持和apis一致的使用方式，二参数位option
 * @return {object}           An object containing either "data" or "err"
 */
async function awardFetch(options: string | IOpt1, otherOptions?: object): Promise<any> {
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

  options = reduce(
    _interceptors.request,
    (req, interceptor): IOpt1 => {
      const result = interceptor(req);
      if (result) {
        return result;
      } else {
        return req;
      }
    },
    options
  );

  let response;

  (options as any).basename = awardFetch.basename;

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
  return response.then((data: any) => {
    return reduce(
      _interceptors.response,
      (res, interceptor) => {
        const result = interceptor(res);
        if (result) {
          return result;
        } else {
          return res;
        }
      },
      data
    );
  });
}

const interceptors = {
  request: {
    use: (func: Function) => {
      _interceptors.request.push(func);
    }
  },
  response: {
    use: (func: Function) => {
      _interceptors.response.push(func);
    }
  }
};

// 同时处理多个fetch
// {
//   a: fetchFunc1,
//   b: fetchFunc2,
// }
// ====> Promise
// {
//   a: fetchRes1,
//   b: fetchRes2,
// }
function all(fetches: any) {
  return fetches;
}

// 取消fetch，目前仅支持xhr取消
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

export default awardFetch;
