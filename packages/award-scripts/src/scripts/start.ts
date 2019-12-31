import { PortIsOccupied } from '../tools/tool';
import { Server } from '../tools/server';

export default {
  command: 'start [env]',
  description: '开始项目',
  options: [
    {
      command: '-p, --port [value]',
      description: `设置服务端口`,
      default: '1234'
    }
  ],
  action(argv: any, options: any = {}) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';

    PortIsOccupied(options.port);
    try {
      new Server(
        {
          isProxy: true,
          port: options.port
        },
        true
      )
        .listen()
        .catch((err: any) => {
          throw err;
        });
    } catch (err) {
      console.error(err);
      process.exit(0);
    }
  }
};
