import nodePlugin from 'award-plugin/node';
import { getAwardConfig } from 'award-utils/server';
import chalk = require('chalk');
import { prod } from '../../../tools/build';
import prepare from '../../../tools/tool/prepare';

prepare(true, false);

console.info(chalk.green('Start Node Compiling...'));
const config = getAwardConfig();

(async () => {
  try {
    await nodePlugin.hooks.beforeBuild({
      run_env: 'node',
      config
    });

    await prod.node(process.cwd());

    await nodePlugin.hooks.afterBuild({
      run_env: 'node',
      config
    });

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(-1);
  }
})();
