/* eslint-disable array-callback-return */
/**
 * 处理第三方依赖的extensions扩展
 */
import * as fs from 'fs-extra';
import { IConfig } from 'award-types';
import { join, relative } from 'path';
import Constant from './constant';

const dir = process.cwd();

export default (config: IConfig) => {
  const extensions = ['.css', '.less', '.scss'];
  const images = ['.jpg', '.png', '.jpeg', '.gif'];

  const cachePath = join(dir, config.server_dist, Constant.IAMGECACHENAME);

  let map: any = {};

  if (fs.existsSync(cachePath)) {
    map = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
  }

  if (typeof require !== 'undefined') {
    [...extensions, ...images].map((item: any) => {
      require.extensions[item] = (data) => {
        if (images.indexOf(item) !== -1) {
          let url: any = data.filename;
          if (!/^http(s)?:|^\/\//.test(url)) {
            const _path = relative(dir, url);
            if (map[_path]) {
              url = config.assetPrefixs + 'images/' + map[_path];
            }
          }
          data.exports = url;
        }
      };
    });
  }
};
