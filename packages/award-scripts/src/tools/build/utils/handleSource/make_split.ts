/**
 * 合并拆分的样式
 */
import * as fs from 'fs-extra';
import { join } from 'path';
import { clean } from '../../../tool';

export default (map: any, dir: any, publicPath: any) => {
  const splitMapPath = join(dir, publicPath, 'split-style.json');
  if (!fs.existsSync(splitMapPath)) {
    return map;
  }

  const splitMap = JSON.parse(fs.readFileSync(splitMapPath, 'utf-8'));
  const { split, hash } = splitMap;

  for (let key in split) {
    if (map[key]) {
      // 说明map本身导出了样式，需要把当前key下面的资源全部合并到map
      let currentCssPath = join(dir, publicPath, 'styles', map[key]);
      currentCssPath = /\.css$/.test(currentCssPath) ? currentCssPath : currentCssPath + '.css';
      let css = fs.existsSync(currentCssPath) ? fs.readFileSync(currentCssPath, 'utf-8') : '';
      split[key].forEach((item: any) => {
        if (map[item]) {
          const modulePath = join(dir, publicPath, 'styles', map[item]);
          css += fs.readFileSync(modulePath, 'utf-8');
          clean(modulePath);
          delete map[item];
        }
      });
      // 重写样式
      fs.writeFileSync(currentCssPath, css);
    } else {
      // 说明当前的map本身没有样式，样式来源当前chunk的chunk
      // 需要找出hash
      const mapHash = hash[key];
      const filename = mapHash + '.css';

      let css = '';
      split[key].forEach((item: any) => {
        if (map[item]) {
          const modulePath = join(dir, publicPath, 'styles', map[item]);
          css += fs.readFileSync(modulePath, 'utf-8');
          clean(modulePath);
          delete map[item];
        }
      });
      if (css) {
        fs.writeFileSync(join(dir, publicPath, 'styles', filename), css);
        map[key] = filename;
      }
    }
  }

  clean(splitMapPath);

  return map;
};
