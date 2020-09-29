/**
 * 用于解决fetch不支持部分xhr功能（onprogress等）
 * options已处理
 */
import forEach = require('lodash/forEach');
import isFunction = require('lodash/isFunction');
import { IOpt2 } from '../interfaces/fetchOptions';
import { COMMONERROR, ABORTERROR } from './constant';

export default function request(options: IOpt2): Promise<any> {
  return new Promise((resolve: (rdata: any) => void, reject: (reason: any) => void) => {
    const {
      method,
      url,
      params,
      body,
      headers,
      dataType,
      transformResponse,
      onDownloadProgress,
      onUploadProgress,
      timeout,
      withCredentials,
      cancelToken
    } = options;

    let xhr: XMLHttpRequest | null = new XMLHttpRequest();

    xhr.open(method, `${url}${params}`);
    forEach(headers, (v: string, k: string) => {
      (xhr as XMLHttpRequest).setRequestHeader(k, v);
    });

    xhr.onload = () => {
      if (!xhr || xhr.readyState !== 4) {
        return;
      }

      if (xhr.status === 0 && !(xhr.responseURL && xhr.responseURL.indexOf('file:') === 0)) {
        return;
      }

      try {
        checkStatus({
          url,
          status: xhr.status,
          statusText: xhr.statusText
        } as any);
        const responseData =
          !dataType || dataType === 'string' || dataType === 'text'
            ? xhr.responseText
            : transformResponse(xhr.response);

        resolve(responseData);
      } catch (error) {
        error.award = COMMONERROR;
        reject(error);
      }

      xhr = null;
    };

    if (timeout) {
      xhr.timeout = Number(timeout);
    }

    xhr.onerror = () => {
      const error: any = new Error('network error');
      error.award = COMMONERROR;
      reject(error);
      xhr = null;
    };

    xhr.ontimeout = () => {
      const error: any = new Error(`request ${url} timeout`);
      error.award = COMMONERROR;
      reject(error);
      xhr = null;
    };

    xhr.onabort = function onabort() {
      if (!xhr) {
        return;
      }
      const error: any = new Error(`request ${url} abort`);
      error.award = ABORTERROR;
      reject(error);
      xhr = null;
    };

    if (withCredentials) {
      xhr.withCredentials = true;
    }

    if (isFunction(onDownloadProgress)) {
      xhr.addEventListener('progress', onDownloadProgress);
    }

    if (isFunction(onUploadProgress) && xhr.upload) {
      xhr.upload.addEventListener('progress', onUploadProgress);
    }

    if (cancelToken?.promise) {
      cancelToken.promise.then((cancel: string) => {
        if (!xhr) {
          return;
        }

        if (cancel) {
          reject(cancel);
        }
        xhr.abort();
        xhr = null;
      });
    }

    xhr.send(body);
  });
}

export function checkStatus(response: Response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }

  throw { status: 500, message: `${response.url}: ${response.statusText}`, fetch: true, response };
}
