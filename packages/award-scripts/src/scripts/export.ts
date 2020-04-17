import * as fs from 'fs-extra';
import clean from '../tools/tool/clean';
import constant from '../tools/tool/constant';
import exportProject from '../library/export';

export default {
  command: 'export',
  description: '导出纯单页应用项目',
  options: [
    {
      command: '-b, --browser',
      description: '通过本地file协议访问导出包'
    },
    {
      command: '-l, --local',
      description: `指定导出本地包，assetPrefixs会重置为"./"`
    },
    {
      command: '--html',
      description: '页面路由切换时会加载对应的html页面'
    }
  ],
  async action(argv: any) {
    process.env.WEB_TYPE = 'WEB_SPA';
    process.env.EXPORTRUNHTML = argv.html ? '1' : '0';
    if (fs.existsSync(constant.CACHE_DIR)) {
      clean(constant.CACHE_DIR);
    }
    fs.mkdirpSync(constant.CACHE_DIR);
    exportProject({
      browser: argv.browser,
      local: argv.local,
      html: argv.html
    });
  }
};
