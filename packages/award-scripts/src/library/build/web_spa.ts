import { getAwardConfig } from 'award-utils/server';
import { complierInfo } from '../../tools/tool';
import { prod } from '../../tools/build';
import nodePlugin from 'award-plugin/node';

export default async (assetPrefixs: string) => {
  const config = getAwardConfig();

  process.env.ROUTER = process.env.ROUTER || config.router;
  process.env.HASHNAME = config.hashName ? '1' : '0';

  complierInfo('Compiling...');

  await nodePlugin.hooks.beforeBuild({
    run_env: 'web_spa',
    config
  });

  await prod.web({
    dir: process.cwd(),
    publicPath: config.export_dist + '/dest',
    assetPrefixs,
    mapDir: config.export_dist
  });

  await nodePlugin.hooks.afterBuild({
    run_env: 'web_spa',
    config
  });
};
