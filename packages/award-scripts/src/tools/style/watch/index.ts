import * as fs from 'fs-extra';
import { extname } from 'path';
import * as chokidar from 'chokidar';
import { memoryFile, regNodeModules } from '../../help';
import watchImport from './watch-import';
import { watchPath, watchImagesPath, watchStyleSheet, hmrStyleSheetPath } from '../utils/constant';

let watchFiles: any = [];
let unlink: any = {};

const watch = () => {
  /**
   * {
   *  ['stylepath']:[
   *    'a.js','b.js'
   *  ],
   *  ['@import path']:[
   *    'a.css','b.css'
   *  ]
   * }
   */
  if (memoryFile.existsSync(watchPath)) {
    let map = JSON.parse(memoryFile.readFileSync(watchPath, 'utf-8'));
    let keys = Object.keys(map);
    if (keys.length) {
      const error: any = [];
      // 对map的样式资源引用重新解析，主要处理样式引用样式
      // 列如 @import './a.scss';
      // 需要处理@import的资源，且需遍历递归处理
      watchImport(keys, map, error);
      memoryFile.writeFileSync(watchPath, JSON.stringify(map));

      // 获取新的keys
      keys = Object.keys(map);
      keys = keys.filter((item) => watchFiles.indexOf(item) === -1 && !/\.(t|j)sx?$/.test(item));
      watchFiles = [...keys, ...watchFiles];

      if (keys.length) {
        // 监听新的scss文件
        chokidar.watch(keys, { ignored: regNodeModules }).on('change', (path: any) => {
          const styleLists = JSON.parse(memoryFile.readFileSync(watchPath, 'utf-8'));
          const styleMaps = styleLists[path];
          styleMaps.forEach((item: any) => {
            fs.utimesSync(item, new Date(), new Date());
          });
        });
      }

      if (error.length) {
        throw error[0];
      }
    }
  }

  if (memoryFile.existsSync(watchImagesPath)) {
    let map = memoryFile.readFileSync(watchImagesPath, 'utf-8');
    map = JSON.parse(map);
    let keys = Object.keys(map);
    if (keys.length) {
      chokidar.watch(keys, { ignored: regNodeModules }).on('all', (event: any, path: any) => {
        if (event === 'change' || (event === 'add' && unlink[path])) {
          delete unlink[path];
          const _path = map[path];
          _path.forEach((item: any) => {
            (fs as any).utimesSync(item, new Date(), new Date(), () => {});
          });
        }
        if (event === 'unlink') {
          unlink[path] = 1;
        }
      });
    }
  }
};

// koa 中间件
export default (compiler: any, app: any) => {
  let style_time: any = null;

  app.use(async (ctx: any, next: any) => {
    // award.css
    if (/^\/award\.css/.test(ctx.request.url)) {
      ctx.status = 200;
      ctx.type = '.css';
      ctx.body = memoryFile.existsSync(watchStyleSheet)
        ? memoryFile.readFileSync(watchStyleSheet)
        : '';
      return;
    }

    // 热更新样式
    if (style_time) {
      const timeName = `/${style_time}.css`;
      if (ctx.request.url === timeName) {
        if (memoryFile.existsSync(hmrStyleSheetPath)) {
          ctx.status = 200;
          ctx.type = extname(ctx.request.url);
          ctx.body = memoryFile.readFileSync(hmrStyleSheetPath);
          return;
        }
      }
    }

    // 图片或其他静态资源
    if (/^\/static\//.test(ctx.request.url)) {
      if (memoryFile.existsSync(ctx.request.url)) {
        ctx.status = 200;
        ctx.type = extname(ctx.request.url);
        ctx.body = memoryFile.readFileSync(ctx.request.url);
        return;
      }
    }
    await next();
  });

  compiler.hooks.invalid.tap('invalid', () => {
    style_time = Number(new Date());
    // 标识展示一次cache
    global.style_cache_tip = true;
    global.style_hmr_tip = true;

    // 标识热更新
    global.style_hmr = true;
    // 默认设置不需要hmr
    global.style_change_hmr = false;
    // 需要传入' ', 否则会报错
    memoryFile.writeFileSync(hmrStyleSheetPath, ' ');
  });

  compiler.hooks.done.tap('done', async (stats: any) => {
    if (style_time && global.style_change_hmr) {
      global.EventEmitter.emit('hmrStyle', {
        name: 'project_style_hmr',
        url: style_time + '.css'
      });
    }
    const extraFile = stats.extraFile;
    if (extraFile?.length) {
      stats.extraFile = [];
      global.EventEmitter.emit('hmrStyle', {
        name: 'node_modules_style_hmr',
        data: extraFile
      });
    }
    global.style_change_hmr = false;
    watch();
  });
};
