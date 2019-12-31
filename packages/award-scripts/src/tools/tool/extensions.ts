/* eslint-disable array-callback-return */
/**
 * 处理第三方依赖的extensions扩展
 */
import * as fs from 'fs-extra';
import { memoryFile } from '../help';
import { basename, join } from 'path';
import * as md5 from 'md5';

export default () => {
  const extensions = ['.css', '.less', '.scss'];
  const images = ['.jpg', '.png', '.jpeg', '.gif'];

  if (typeof require !== 'undefined') {
    [...extensions, ...images].map((item: any) => {
      require.extensions[item] = data => {
        if (images.indexOf(item) !== -1) {
          let url: any = data.filename;
          if (!/^http(s)?:|^\/\//.test(url)) {
            if (!fs.existsSync(url)) {
              throw new Error(`Path '${url}' could not be found`);
            } else {
              const imageContent = fs.readFileSync(url);
              const filename = basename(url);

              let _filename: any = filename.split('.');

              const ext: any = _filename.pop();
              _filename = _filename.join('.');

              const new_dir = '/static/images';

              if (!memoryFile.existsSync(new_dir)) {
                memoryFile.mkdirpSync(new_dir);
              }

              // 文件名称
              _filename = md5(imageContent).substr(0, 7) + '.' + ext;

              url = join(new_dir, _filename);

              memoryFile.writeFileSync(url, imageContent);
            }
          }
          data.exports = url;
        }
      };
    });
  }
};
