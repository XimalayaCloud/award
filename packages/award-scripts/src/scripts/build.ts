import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import clean from '../tools/tool/clean';
import web_ssr from '../library/build/web_ssr';
import web_server from '../library/build/web_server';
import { clearConsole, constant } from '../tools/tool';

export default {
  command: 'build',
  description: '构建项目',
  options: [
    {
      command: '--web',
      description: `构建web客户端资源`
    },
    {
      command: '--node',
      description: `构建node服务端资源`
    }
  ],
  async action(argv: any) {
    process.env.NODE_ENV = process.env.NODE_ENV || 'production';
    process.env.WEB_TYPE = 'WEB_SSR';
    clearConsole();
    if (argv.web || argv.node) {
      console.warn(
        `${chalk.yellow('[供测试使用]')} 生产构建请直接执行 ${chalk.green('award build')}`
      );
    }
    if (argv.web) {
      await web_ssr();
    } else if (argv.node) {
      await web_server();
    } else {
      if (fs.existsSync(constant.CACHE_DIR)) {
        clean(constant.CACHE_DIR);
      }
      fs.mkdirpSync(constant.CACHE_DIR);
      await web_ssr();
      await web_server();
    }
    // 执行结束。立即中断node程序
    process.exit(0);
  }
};
