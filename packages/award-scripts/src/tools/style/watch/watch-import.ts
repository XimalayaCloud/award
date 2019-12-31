/* eslint-disable no-param-reassign */
import * as fs from 'fs-extra';
import * as path from 'path';
import { requireResolve } from '../../help';

export default function watchImport(styleKeys: any, map: any, error: any): any {
  styleKeys.map((stylePath: any) => {
    if (fs.existsSync(stylePath)) {
      const css = fs.readFileSync(stylePath, 'utf-8');
      const matchs = css.match(/\@import(.*;)/g);
      if (matchs) {
        matchs.map(match => {
          match = match.replace(/@import|\s|'|"|;/g, '');

          if (!/\.scss|css|sass$/.test(match)) {
            match = match + '.scss';
          }
          // 以../ 或者 ./开头的引用，即相对路径引用
          // ../style/mixin.scss
          let currentImportPath = '';
          if (/^\.+\//.test(match)) {
            const mod = requireResolve(match, path.resolve(stylePath));
            if (mod) {
              currentImportPath = mod.src;
            } else {
              error[0] = `无法解析文件${stylePath}中的@import的引用，引用地址是【${match}】,请确认文件名称是否正确`;
            }
          } else {
            // 绝对路径引用
            currentImportPath = path.join(process.cwd(), match);
            if (!fs.existsSync(currentImportPath)) {
              error[0] = `无法解析文件${stylePath}中的@import的引用，引用地址是【${match}】,请确认文件名称是否正确`;
            }
          }

          if (!error.length && currentImportPath) {
            if (!map[currentImportPath]) {
              map[currentImportPath] = [stylePath];
            } else if (map[currentImportPath].indexOf(stylePath) === -1) {
              map[currentImportPath].push(stylePath);
            }
            watchImport([currentImportPath], map, error);
          }
        });
      }
    }
  });
}
