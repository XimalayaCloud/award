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
   private API_ECONNREFUSED_RETRY_TIME: any;
 
   public constructor(API_RETRY_TIME: any, API_APIGATEWAY_OPEN: any, timeout: any, API_ECONNREFUSED_RETRY_TIME: any) {
     this.API_RETRY_TIME = API_RETRY_TIME;
     this.API_APIGATEWAY_OPEN = API_APIGATEWAY_OPEN;
     this.timeout = timeout;
     this.API_ECONNREFUSED_RETRY_TIME = API_ECONNREFUSED_RETRY_TIME; 
     if (process.env.NODE_ENV === 'development') {
       instance = new APIGateway();
     }
   }
 
   public async startFetch(options: IOpt1, retryTime = this.API_RETRY_TIME, refusedRetryTiem = this.API_ECONNREFUSED_RETRY_TIME): Promise<any> {
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
       try {
         return await fetch({
           ...options,
           url: uri,
           timeout: this.timeout
         })
           .then((response) => {
             if (this.API_RETRY_TIME && retryTime > 0) {
               // 设置了重试次数，且当前重试次数 > 0
               if (response.status < 200 || response.status > 350) {
                 throw {
                   type: 1,
                   message: `${response.url}: ${response.statusText}`
                 };
               }
             }
             return response;
           })
           .catch((err) => {
             throw err;
           });
       } catch (e) {
         if (e.type === 1) {
           if (retryTime > 0) {
             log.error(e.message, 'server-fetch-retry');
             return this.startFetch(options, --retryTime);
           }
         } else if (e.code === 'ECONNREFUSED') {
           if (refusedRetryTiem > 0) {
             log.error(e.message, 'server-fetch-eeconnefused');
             return this.startFetch(options, retryTime, --refusedRetryTiem);
           }
         } else {
           throw e;
         }
       }
     } catch (err) {
       log.error(err, 'apiGetWay-getUri-error');
       return Promise.reject(err);
     }
   }
   private async getApiGatewayUri(url: string) {
     // 如 是http开头，直接返回url
     if (/^http(s)?:/.test(url)) {
       return url;
     }
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
 
 export default (options: IOpt1) => {
   const { fetch: fetchConfig }: any = getAwardConfig();
   const { timeout = 5000 } = fetchConfig;
   const _apiGatewayConfig = { ...apiGatewayConfig, ...fetchConfig.apiGateway };
   const { API_RETRY_TIME, API_APIGATEWAY_OPEN, API_ECONNREFUSED_RETRY_TIME } = _apiGatewayConfig;
 
   const httpClient = new HttpClient(API_RETRY_TIME, API_APIGATEWAY_OPEN, timeout, API_ECONNREFUSED_RETRY_TIME);
 
   // __headers 为后续服务端带cookie请求数据留
   // options.headers = Object.assign(...options.__headers, options.headers);
   // apiGetWay
   if (API_APIGATEWAY_OPEN) {
     Object.assign(options.headers || {}, {
       Host: getDomain(options.url)
     });
   }
 
   return httpClient.startFetch({
     ...options
   });
 };
 