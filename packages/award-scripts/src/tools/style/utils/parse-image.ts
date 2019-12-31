import * as fs from 'fs-extra';
import { requireResolve, memoryFile } from '../../help';
import * as mime from 'mime';
import * as md5 from 'md5';
import { resolve, basename, join } from 'path';
import { watchImagesPath } from './constant';

import { dev } from '.';

const sprites = join(process.cwd(), '.es-sprites');

export default ({
  publicEntry,
  url,
  reference,
  write,
  imageOptions,
  publicPath,
  state
}: any = {}) => {
  imageOptions.path = imageOptions.path || 'dist/images';

  let new_src = url;
  // 不是外链地址 http:// 、https://、//
  if (!/^http(s)?:|^\/\//.test(url)) {
    if (!/^[\.|\/]/.test(url)) {
      // 不以点开头，相对路径
      // 不以斜杠开头，绝对路径
      // 那么就是这种写法 url(a.jpg) 默认相对路径，需加上
      url = './' + url;
    }
    const mod = requireResolve(url, resolve(reference));
    if (!mod || !mod.src) {
      throw new Error(`Path '${url}' could not be found for '${reference}'`);
    } else {
      const src = mod.src;
      const stat = fs.statSync(src);
      const data = fs.readFileSync(src);

      if (imageOptions.limit && stat.size < imageOptions.limit) {
        // 转成base64
        const mimetype = mime.getType(src);
        new_src = `data:${mimetype || ''};base64,${data.toString('base64')}`;
      } else {
        // 拷贝图片到输出目录
        /**
         * /user/a
         * /user/a/dist
         * imageName.ext
         */
        const filename = basename(src);
        let _filename: any = filename.split('.');
        const ext: any = _filename.pop();
        _filename = _filename.join('.');
        // 文件名称
        _filename = _filename + '_' + md5(data).substr(0, 7) + '.' + ext;
        let outputFile = imageOptions.path + _filename;
        if (dev()) {
          // 开发模式，文件写入到内存中
          const new_dir = '/static/' + imageOptions.path;

          if (!new RegExp(`^${sprites}`).test(src)) {
            let map: any = {};
            if (memoryFile.existsSync(watchImagesPath)) {
              const filemap = memoryFile.readFileSync(watchImagesPath, 'utf-8');
              map = JSON.parse(filemap);
            }
            if (map[src]) {
              map[src].push(reference);
            } else {
              map[src] = [reference];
            }
            memoryFile.writeFileSync(watchImagesPath, JSON.stringify(map));
          }

          if (!memoryFile.existsSync(new_dir)) {
            memoryFile.mkdirpSync(new_dir);
          }

          new_src = new_dir + _filename;
          outputFile = new_src;
          memoryFile.writeFileSync(new_src, data);
          state.images[new_src] = src;
          new_src = '/award_dev_static' + new_src;
        } else {
          new_src = [publicPath, imageOptions.path, _filename].join('');
          // 当前可写资源
          if (write) {
            fs.copySync(src, join(publicEntry, imageOptions.path, _filename));
          }
        }
        global.staticSource[outputFile] = data;
      }
    }
  }

  return new_src;
};
