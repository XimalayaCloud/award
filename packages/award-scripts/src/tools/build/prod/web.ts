import { getAwardConfig } from 'award-utils/server';
import { clean } from '../../tool';
import { join } from 'path';

import web from '../webpack/web.prod.config';
import dll from '../dll';

import ProdCompiler from '../utils/prod.compiler';
import webpackCompiler from '../utils/webpack.compiler';
import handleSource from '../utils/handleSource';
import judgeIsUseRoute from '../utils/useRoute';
import external from '../utils/external';

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
    const isUseRoute: any = await judgeIsUseRoute();

    // 判断是否需要编译dll文件
    await dll(dir, assetPrefixs, isUseRoute);

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

    /** 处理external资源 */
    external(dir, publicPath);
  } catch (e) {
    if (e) {
      console.error(e);
    }
    resetStore();
    process.exit(-1);
  }
};
