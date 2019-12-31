import { getAwardConfig } from 'award-utils/server';
import nodePlugin from 'award-plugin/node';
import chalk = require('chalk');
import { prod } from '../../tools/build';

export default async () => {
  console.info(chalk.green('Start Web Compiling...'));
  const config = getAwardConfig();
  const cwd = process.cwd();

  process.env.ROUTER = config.router;
  process.env.HASHNAME = config.hashName ? '1' : '0';

  await nodePlugin.hooks.beforeBuild({
    run_env: 'web_ssr',
    config
  });

  await prod.web({
    dir: cwd,
    publicPath: config.client_dist,
    assetPrefixs: config.assetPrefixs,
    mapDir: config.server_dist + '/.awardConfig'
  });

  await nodePlugin.hooks.afterBuild({
    run_env: 'web_ssr',
    config
  });
};
