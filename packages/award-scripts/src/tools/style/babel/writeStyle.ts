import chalk = require('chalk');
import { memoryFile } from '../../help';
import { watchPath, watchStyleSheet, hmrStyleSheetPath } from '../utils/constant';

let timed: any = null;

export default (state: any) => {
  const reference = state?.file?.opts.filename;
  if (!global.storeStyleSheet) {
    global.storeStyleSheet = {};
  }
  global.storeStyleSheet[reference] = state.css;

  if (global.style_change_hmr && global.style_hmr) {
    if (global.style_hmr_tip) {
      global.style_hmr_tip = false;
      console.info(chalk.yellow('[award-style:hmr]\n'));
    }
    let content = state.css;
    if (memoryFile.existsSync(hmrStyleSheetPath)) {
      content += memoryFile.readFileSync(hmrStyleSheetPath, 'utf-8');
    }
    memoryFile.writeFileSync(hmrStyleSheetPath, content);
  }

  // 通过防抖策略，处理样式
  if (timed) {
    clearTimeout();
  }
  timed = setTimeout(() => {
    // 写main.css
    let content = '';
    for (const key in global.storeStyleSheet) {
      if (Object.prototype.hasOwnProperty.call(global.storeStyleSheet, key)) {
        content = content + global.storeStyleSheet[key];
      }
    }
    memoryFile.writeFileSync(watchStyleSheet, content);
  }, 0);

  // 写css文件资源映射信息到内存文件中
  let map = state.styleSourceMap;
  if (memoryFile.existsSync(watchPath)) {
    map = JSON.parse(memoryFile.readFileSync(watchPath, 'utf-8'));
    for (const stylePath in state.styleSourceMap) {
      if (Object.prototype.hasOwnProperty.call(state.styleSourceMap, stylePath)) {
        const references = state.styleSourceMap[stylePath];
        // map中存在已经该样式的path
        if (map[stylePath]) {
          references.forEach((reference: string) => {
            if (map[stylePath].indexOf(reference) === -1) {
              // push当前样式对应的js引用不存在的文件
              map[stylePath].push(reference);
            }
          });
        } else {
          map[stylePath] = references;
        }
      }
    }
  }
  memoryFile.writeFileSync(watchPath, JSON.stringify(map));
};
