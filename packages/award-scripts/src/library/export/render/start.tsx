import * as fs from 'fs-extra';
import * as path from 'path';
import { getAwardConfig } from 'award-utils/server';

import register from './register';
import load from './load';
import render from './render';
import renderHtml from './html';
import { complierInfo, clean } from '../../../tools/tool';

module.exports = async (assetPrefixs: string, port?: number | null) => {
  try {
    const config = getAwardConfig();
    config.assetPrefixs = assetPrefixs;
    register(config);
    const dir = process.cwd();
    const manifestDir = path.join(dir, config.export_dist, 'manifest.js');
    const mapDir = path.join(dir, config.export_dist, 'map.json');

    // 读取manifest.js文件，这是前端的基础文件，导出时内嵌到html页面中
    const manifest = fs.existsSync(manifestDir) ? fs.readFileSync(manifestDir, 'utf-8') : '';
    const map: any = fs.existsSync(mapDir) ? JSON.parse(fs.readFileSync(mapDir, 'utf-8')) : {};

    // 拼接单独页面
    const { exportPath }: any = config;
    const ctx: any = {
      award: {
        url: '/',
        search: '',
        map,
        dev: false,
        routes: [],
        match_routes: [],
        match: true,
        RootComponent: () => null,
        RootDocumentComponent: null,
        initialState: { award: {} },
        config,
        modules: []
      }
    };

    // 不变值
    const { RootDocumentComponent, RootComponent, routes } = await load(config, dir);
    ctx.award.RootDocumentComponent = RootDocumentComponent;
    ctx.award.routes = routes;
    ctx.award.RootComponent = RootComponent;

    console.info();

    if (exportPath && Object.keys(exportPath).length) {
      for (const htmlName in exportPath) {
        const _url = exportPath[htmlName].split('?');
        ctx.award.url = _url[0];
        ctx.award.search = _url[1] ? '?' + _url[1] : '';
        const { RootComponent } = await load(config, dir);
        ctx.award.RootComponent = RootComponent;
        ctx.award.RootComponent = await render(ctx);
        await renderHtml(config, ctx, map, manifest, '', htmlName, port);
      }
    } else {
      ctx.award.RootComponent = await render(ctx);
      await renderHtml(config, ctx, map, manifest, '', 'index.html', port);
    }

    clean(manifestDir);
    clean(mapDir);
    complierInfo('导出完成');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(-1);
  }
};
