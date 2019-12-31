import * as http from 'http';
import * as https from 'https';
import { Server } from '../tools/server';

export default {
  command: 'dev [env]',
  description: '启动本地开发环境',
  options: [
    {
      command: '-p, --port [value]',
      description: `设置服务端口`,
      default: '1234'
    },
    {
      command: '-i, --ignore',
      description: `忽略系统错误提示页`
    }
  ],
  action(_argv: any, options: any = {}) {
    options.ignore = options.ignore || false;

    try {
      // 执行server
      new Server({
        port: options.port,
        ignore: options.ignore,
        isProxy: true
      })
        .listen((_listen: http.Server | https.Server, url: string, open: Function) => {
          open(url);
        })
        .catch((err: any) => {
          console.error(err);
          process.exit(0);
        });
    } catch (error) {
      console.error(error);
      process.exit(0);
    }
  }
};
