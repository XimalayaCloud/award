import * as path from 'path';
import * as fs from 'fs-extra';
import clean from '../tools/tool/clean';
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
    const cache = path.join(process.cwd(), 'node_modules', '.cache', 'award');
    if (fs.existsSync(cache)) {
      clean(cache);
    }
    fs.mkdirpSync(cache);
    exportProject({
      browser: argv.browser,
      local: argv.local,
      html: argv.html
    });
  }
};
