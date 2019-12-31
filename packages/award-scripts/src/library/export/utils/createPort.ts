import find = require('find-process');

const ensurePort = (port: number) => {
  // 创建服务并监听该端口
  return new Promise(resolve => {
    find('port', port).then((list: Array<any>) => {
      resolve(list.length);
    });
  });
};

export default async () => {
  let port1 = 1234;
  let port2 = 1235;
  while (await ensurePort(port1)) {
    port1++;
  }
  while (port2 === port1 || (await ensurePort(port2))) {
    port2++;
  }
  return [port1, port2];
};
