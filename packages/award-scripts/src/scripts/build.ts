import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as path from 'path';

import clean from '../tools/tool/clean';
import web_ssr from '../library/build/web_ssr';
import web_server from '../library/build/web_server';
import { clearConsole, constant } from '../tools/tool';
import { getAwardConfig } from 'award-utils/server';

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

      // 并发编译
      await Promise.all([web_ssr(true), web_server()]);

      // 整理dist里面的.awardConfig资源
      const config = getAwardConfig();
      const cwd = process.cwd();

      const distConfig = path.join(cwd, config.client_dist, '.awardConfig');
      const targetConfig = path.join(cwd, config.server_dist, '.awardConfig');

      fs.readdirSync(distConfig).forEach((item) => {
        fs.writeFileSync(
          path.join(targetConfig, item),
          fs.readFileSync(path.join(distConfig, item))
        );
      });
      clean(distConfig);
    }

    console.info(
      chalk.bgGreenBright.black('【编译耗时】'),
      chalk.yellowBright(
        ((Number(new Date()) - Number(process.env.AWARD_START_TIME)) / 1000).toFixed(2) + 's'
      ),
      '\n'
    );

    // 执行结束。立即中断node程序
    process.exit(0);
  }
};
