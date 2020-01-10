import * as path from 'path';
import md5 = require('md5');

export const countDllPkgHash = (data: any) => {
  const l = data.length;
  let i = 0;
  let pkgHash = '';
  while (i < l) {
    const item = data[i];
    const splitPath = item.split('/');
    const sl = splitPath.length;
    let si = 0;
    while (si < sl) {
      const nItem: any = [];
      splitPath.map((item: any, index: any) => {
        if (index <= si) {
          nItem.push(item);
        }
      });
      try {
        const pkgPath = require.resolve(path.join(nItem.join('/'), 'package.json'));
        const version = require(pkgPath).version;
        pkgHash += md5(item + version);
        break;
      } catch (error) {}
      si++;
    }
    i++;
  }
  return pkgHash;
};
