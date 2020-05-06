import { getAwardConfig } from 'award-utils/server';
import values = require('lodash/values');
import thriftPool = require('node-thrift-pool');
import isPlainObject = require('lodash/isPlainObject');
import APIGateway from '../../utils/APIGateway';
import * as DefaultfetchConfig from '../../config/thrift';
import { IOptthrift } from '../../interfaces/fetchOptions';
import fetch from '../server/server';
import log from '../../utils/log';

// 缓存不同thriftKey的连接池
const thriftClients: any = {};

/**
 * 请求参数转换成thrift要求的格式
 * @param  {[object]} data [请求参数]
 * @param  {[object]} types [thrift types]
 * @return {[object]}      [thrift格式]
 */
const formatData = (data: any, thriftRequestModel: string, types: any): any => {
  if (!isPlainObject(data)) {
    return null;
  }

  return thriftRequestModel ? new types[thriftRequestModel](data) : values(data)[0];
};

/**
 * 获取thrift服务器域名 or IP
 */
const getThriftServer = (path?: string): Promise<string> => {
  const { fetch: fetchConfig = {} }: any = getAwardConfig();

  Object.assign(DefaultfetchConfig, fetchConfig && fetchConfig.thrift);

  const { API_APIGATEWAY_OPEN, API_APIGATEWAY_IP, DOMAIN, PORT } = DefaultfetchConfig;

  if (API_APIGATEWAY_OPEN) {
    const APIGatewayInstance = new APIGateway(API_APIGATEWAY_IP);
    return APIGatewayInstance.getApiServer(path).then(apiGatewayServerIP => {
      return apiGatewayServerIP;
    });
  }
  return Promise.resolve(DOMAIN + ':' + PORT);
};

export default (
  options: IOptthrift,
  thriftUtils: {
    getClients: Function;
  },
  isInterceptorsResponse: boolean
): Promise<any> => {
  const { fetch: fetchConfig = {} }: any = getAwardConfig();

  Object.assign(DefaultfetchConfig, fetchConfig && fetchConfig.thrift);

  const {
    THRIFT_OPEN,
    API_APIGATEWAY_PATH,
    THRIFT_MAX_CONNECTIONS,
    TTL,
    IDLE_TIMEOUT,
    TIMEOUT
  } = DefaultfetchConfig;

  if (THRIFT_OPEN) {
    return new Promise((resolve, reject) => {
      const thrift = require('thrift');
      const transport = thrift.TFramedTransport;
      const protocol = thrift.TCompactProtocol;

      const { data, params, body, thrift: thriftKey, thriftMethod, thriftRequestModel } = options;

      const { actions, types } = thriftUtils.getClients(thriftKey);

      getThriftServer(API_APIGATEWAY_PATH).then(addr => {
        try {
          if (!addr) {
            throw {
              status: 500,
              message: 'no thrift host find',
              fetch: true
            };
          }

          const [host, port] = addr.split(':');
          let client = thriftClients[thriftKey];

          if (!client) {
            // 连接池
            client = thriftClients[thriftKey] = thriftPool(
              thrift,
              actions,
              {
                host,
                port,
                max_connections: THRIFT_MAX_CONNECTIONS,
                ttl: TTL,
                idle_timeout: IDLE_TIMEOUT
              },
              {
                transport,
                protocol,
                timeout: TIMEOUT
              }
            );
          }

          const fetchData = formatData(data || params || body, thriftRequestModel, types);
          const callback = (err: Error, re: any) => {
            if (err) {
              log.error(err, 'fetch-to-thrift-err');
              fetch(options, isInterceptorsResponse)
                .then(resolve)
                .catch(reject);
              thriftClients[thriftKey] = null;
            } else {
              resolve(re);
            }
          };

          if (fetchData) {
            client[thriftMethod](fetchData, callback);
          } else {
            client[thriftMethod](callback);
          }
        } catch (e) {
          log.error(e, 'thriftPool-connnect-error');
          // thrift连接失败 换http请求
          fetch(options, isInterceptorsResponse)
            .then(resolve)
            .catch(reject);
          thriftClients[thriftKey] = null;
        }
      });
    });
  }
  return fetch(options, isInterceptorsResponse);
};
