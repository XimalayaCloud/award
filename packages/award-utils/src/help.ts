/**
 * 这里是客户端和服务端都会用的的help方法集合
 */
// 拿到去除前缀后的url
// /basename/pathname
export const realPath = (basename: string, url: string): string => {
  if (basename) {
    return url.replace(new RegExp(`^${basename}\/?`), '/');
  }
  return url;
};

export const pathname = () => {
  const { pathname: pname } = window.location;
  let { hash } = window.location;
  hash = hash.replace('#', '');
  if (process.env.ROUTER === 'hash') {
    return hash === '' ? '/' : hash.split('?')[0];
  } else {
    return pname;
  }
};

export const redirect = (url: string) => {
  // window跳转重定向
  const { protocol } = window.location;
  const hash = process.env.ROUTER === 'hash' ? '#' : '';
  if (protocol === 'file:') {
    // file协议访问
    window.location.href = window.location.pathname + '#' + url;
  } else {
    // 非file
    window.location.href = window.location.origin + hash + url;
  }
  if (hash || protocol === 'file:') {
    window.location.reload();
  }
};
