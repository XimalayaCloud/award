import { getAwardConfig } from 'award-utils/server';
import chalk = require('chalk');
import umd from '../../tools/build/umd';

export default async () => {
  console.info(chalk.green('Start Web Compiling...'));
  const config = getAwardConfig();
  const cwd = process.cwd();

  await umd({
    dir: cwd,
    publicPath: config.client_dist,
    assetPrefixs: config.assetPrefixs,
    mapDir: config.server_dist + '/.awardConfig'
  });
};
