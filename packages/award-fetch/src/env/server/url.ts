import { getAwardConfig } from 'award-utils/server';

/**
 * 获取url前缀
 * @example /api/aa  => api
 */
export function getUrlPrefix(url: string) {
  /** http://a.com/b/c */
  if (/^http(s)?:/.test(url)) {
    return '';
  }
  /**  //a.com/b/c **/
  if (/^\/\//.test(url)) {
    throw {
      status: 500,
      message: 'Node端发起http请求时，请指定协议',
      fetch: true
    };
  }
  const { fetch: fetchConfig }: any = getAwardConfig();
  const { domainMap } = fetchConfig;
  if (!domainMap) {
    throw {
      status: 500,
      message: 'Node端发起http请求时，请确保配置了domainMap',
      fetch: true
    };
  }
  let domainPrefix = null;
  Object.keys(domainMap).forEach(item => {
    const matchReg = /^\//.test(item) ? item : '/' + item;
    if (new RegExp(`^${matchReg}`).test(url)) {
      domainPrefix = item;
    }
  });

  if (domainPrefix) {
    return domainPrefix;
  }
  throw {
    status: 500,
    message: `Node端发起请求[${url}]，没有找到对应的domainMap`,
    fetch: true
  };
}

/**
 * 获取url的域名端口
 * @example /api/aa  => localhost
 */
export function getDomain(url: string) {
  const { fetch: fetchConfig }: any = getAwardConfig();
  const { domainMap } = fetchConfig;
  const prefix = getUrlPrefix(url);
  let domain = url;
  if (prefix) {
    domain = domainMap[prefix];
  }
  const res = domain.match(/https?:\/\/(.+)/);
  return (res && res[1]) || '';
}

/**
 * 获取完整url
 * @example /api/aa  => http://localhost/api/aa
 */
export function getFullUrl(url: string) {
  const { fetch: fetchConfig }: any = getAwardConfig();
  const { domainMap } = fetchConfig;
  const prefix = getUrlPrefix(url);
  return `${(prefix && domainMap[prefix]) || ''}${url}`;
}
