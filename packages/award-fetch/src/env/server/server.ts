/**
 * NODE端请求
 */

import { getAwardConfig } from 'award-utils/server';
import APIGateway from '../../utils/APIGateway';
import * as apiGatewayConfig from '../../config/apiGateway';
import { IOpt1 } from '../../interfaces/fetchOptions';
import log from '../../utils/log';
import { getDomain, getFullUrl } from './url';
import fetch from '../../utils/fetch';

let instance = new APIGateway();
class HttpClient {
  private API_RETRY_TIME: any;
  private API_APIGATEWAY_OPEN: any;
  private timeout: any;

  public constructor(API_RETRY_TIME: any, API_APIGATEWAY_OPEN: any, timeout: any) {
    this.API_RETRY_TIME = API_RETRY_TIME;
    this.API_APIGATEWAY_OPEN = API_APIGATEWAY_OPEN;
    this.timeout = timeout;
    if (process.env.NODE_ENV === 'development') {
      instance = new APIGateway();
    }
  }

  public async startFetch(
    options: IOpt1,
    isInterceptorsResponse: boolean,
    retryTime = this.API_RETRY_TIME
  ): Promise<any> {
    const { url } = options;
    try {
      const uri = await this.getUri(url);
      if (!/^http(s)?:/.test(uri)) {
        throw {
          status: 500,
          message: `请求地址[${url}]匹配的domain必须设置http协议，当前node请求的完整url为${uri}`,
          fetch: true
        };
      }
      const _time1 = Number(new Date());
      console.info(`[server-fetch-start]:${uri}`);
      try {
        const data = await fetch(
          {
            ...options,
            url: uri,
            timeout: this.timeout
          },
          isInterceptorsResponse
        ).then(response => {
          if (response.status < 200 || response.status > 350) {
            // 需要重试
            throw { status: 500, message: `${response.url}: ${response.statusText}`, fetch: true };
          }
          return response;
        });
        const _time2 = Number(new Date());
        console.info(`[server-fetch-end]:${uri}(${_time2 - _time1}ms)`);
        return data;
      } catch (e) {
        if (retryTime > 0) {
          log.error(uri, 'server-fetch-retry');
          return this.startFetch(options, isInterceptorsResponse, --retryTime);
        }
        log.error(e.message, 'server-fetch-error');
        return Promise.reject(e);
      }
    } catch (err) {
      log.error(err, 'apiGetWay-getUri-error');
      return Promise.reject(err);
    }
  }
  private async getApiGatewayUri(url: string) {
    const apiGatewayServerIP = await instance.getApiServer();
    return `http://${apiGatewayServerIP}${url}`;
  }
  private getUri(url: string): Promise<string> {
    if (Number(process.env.Browser) === 1) {
      return Promise.resolve(url);
    }
    if (this.API_APIGATEWAY_OPEN) {
      return this.getApiGatewayUri(url);
    }
    return Promise.resolve(getFullUrl(url));
  }
}

export default (options: IOpt1, isInterceptorsResponse: boolean) => {
  const { fetch: fetchConfig }: any = getAwardConfig();
  const { timeout = 5000 } = fetchConfig;
  Object.assign(apiGatewayConfig, fetchConfig.apiGateway);
  const { API_RETRY_TIME, API_APIGATEWAY_OPEN } = apiGatewayConfig;

  const httpClient = new HttpClient(API_RETRY_TIME, API_APIGATEWAY_OPEN, timeout);

  // __headers 为后续服务端带cookie请求数据留
  // options.headers = Object.assign(...options.__headers, options.headers);
  // apiGetWay
  if (API_APIGATEWAY_OPEN) {
    Object.assign(options.headers || {}, {
      Host: getDomain(options.url)
    });
  }

  return httpClient.startFetch(
    {
      ...options
    },
    isInterceptorsResponse
  );
};
