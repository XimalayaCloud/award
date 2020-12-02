import * as fs from 'fs-extra';
import { getAwardConfig } from 'award-utils/server';
import { join } from 'path';

import { clean } from '../../tool';
import web from '../webpack/web.umd.config';

import ProdCompiler from '../utils/prod.compiler';
import webpackCompiler from '../utils/webpack.compiler';
import handleSource from '../utils/handleSource';

// 编译在线包代码
export default async ({ dir, publicPath, assetPrefixs, mapDir }: any) => {
  const config = getAwardConfig(dir);
  clean(join(dir, publicPath));
  clean(join(dir, mapDir));

  const resetStore = () => {
    clean(join(dir, publicPath));
    clean(join(dir, mapDir));
  };

  process.on('SIGINT', async () => {
    resetStore();
    process.exit(-1);
  });

  const entry = join(dir, config.entry);

  // 解析判断是否使用路由
  try {
    // 开始编译web资源
    // 获取配置，同时提取award.config.js里面的webpack配置信息
    await ProdCompiler(
      await webpackCompiler(
        config.webpack,
        web({
          entry,
          outPath: join(dir, publicPath),
          assetPrefixs,
          dir,
          crossOrigin: config.crossOrigin
        }),
        {
          isServer: false,
          isAward: true,
          dev: false,
          dir
        }
      )
    );

    /** 整理资源 */
    await handleSource(dir, publicPath, mapDir);

    /** 整理UMD资源 */
    const styleMain = join(dir, publicPath, 'styles/main.css');
    let styleCss = '';
    if (fs.existsSync(styleMain)) {
      styleCss = fs.readFileSync(styleMain, 'utf-8');
    }

    fs.writeFileSync(
      join(dir, publicPath, 'index.js'),
      (styleCss
        ? `var style = document.createElement('style');style.innerHTML = \`${styleCss}}\`;document.head.appendChild(style);`
        : '') + fs.readFileSync(join(dir, publicPath, 'scripts/main.js'), 'utf-8')
    );

    clean(join(dir, publicPath, 'scripts'));
    clean(join(dir, publicPath, 'styles'));
  } catch (e) {
    if (e) {
      console.error(e);
    }
    resetStore();
    process.exit(-1);
  }
};
