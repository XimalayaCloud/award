import nodePlugin from 'award-plugin/node';
import { getAwardConfig } from 'award-utils/server';
import chalk = require('chalk');
import { prod } from '../../tools/build';

export default async () => {
  console.info(chalk.green('Start Node Compiling...'));
  const config = getAwardConfig();

  await nodePlugin.hooks.beforeBuild({
    run_env: 'node',
    config
  });

  await prod.node(process.cwd());

  await nodePlugin.hooks.afterBuild({
    run_env: 'node',
    config
  });
};
