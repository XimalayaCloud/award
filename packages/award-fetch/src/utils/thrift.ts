const clients: any = {};

/**
 * 注册thrift文件
 * @param  {string} key
 * @param  {any}    actions
 * @param  {any}    types
 */
export function register(key: string, actions: any, types: any): void {
  if (clients[key]) {
    return;
  }
  clients[key] = {
    actions,
    types
  };
}

/**
 * 返回已注册的thrift
 * @param  {string} key
 * @return {{actions, types}}
 */
export function getClients(
  key: string
):
  | {
      actions: any;
      types: any;
    }
  | {} {
  return clients[key] || {};
}
