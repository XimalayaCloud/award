import { html } from 'award-render';
import chalk = require('chalk');
import { IConfig } from 'award-types';
import * as fs from 'fs-extra';
import * as path from 'path';

import document from './document';

const cwd = process.cwd();

export default async (
  config: IConfig,
  ctx: any,
  map: any,
  manifest: any,
  externalHtml = '',
  htmlName = 'index.html',
  port?: number | null
) => {
  console.info(` ${chalk.green('渲染')} ${htmlName}`);

  const filename = path.join(cwd, '.award/.awardConfig/react-loadable.json');
  let prodStats: any = null;
  if (fs.existsSync(filename)) {
    prodStats = JSON.parse(fs.readFileSync(filename, 'utf-8'));
  }

  const exportHtml = await html(
    ctx,
    document({
      assetPrefixs: config.assetPrefixs,
      hashName: config.hashName,
      initialState: ctx.award.initialState,
      map,
      manifest,
      externalHtml,
      port,
      modules: ctx.award.modules
    }),
    null,
    prodStats
  );

  console.info(` ${chalk.yellow('创建')} ${htmlName}\n`);
  fs.writeFileSync(
    path.join(process.cwd(), config.export_dist, 'dest', htmlName),
    config.hashName
      ? exportHtml
      : require('html-beautifier/parser')(exportHtml).replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  );
};
