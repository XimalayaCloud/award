import * as postcss from 'postcss';
import * as fs from 'fs-extra';
import * as md5 from 'md5';
import { resolve, join } from 'path';
import { requireResolve, memoryFile } from '../../help';

import { dev } from '../utils';

export default postcss.plugin(
  'postcss-font',
  ({ reference, publicPath, publicEntry, write, fontOptions, state }: any = {}) => {
    fontOptions.path = fontOptions.path || 'dist/fonts';

    return (root: any) => {
      root.walkAtRules((rule: any) => {
        if (rule.name === 'font-face') {
          rule.walkDecls((decl: any) => {
            if (decl.prop === 'src') {
              const match = decl.value.match(/url\((['|"|h|\/|.])([^)]*)\)/g);
              if (match) {
                match.map((item: any) => {
                  const codeUrl = item
                    .match(/\((([^)]*))\)/)[1]
                    .replace(/'|"/g, '')
                    .split('#')
                    .shift()
                    .split('?')
                    .shift();
                  let url = codeUrl;

                  // 不处理base64资源包
                  if (/^data\:/.test(codeUrl)) {
                    return;
                  }

                  // 不处理外链资源包
                  if (/^http(s)?:|^\/\//.test(codeUrl)) {
                    return;
                  }

                  if (!/^[\.|\/]/.test(url)) {
                    // 不以点开头，相对路径
                    // 不以斜杠开头，绝对路径
                    // 那么就是这种写法 url(a.jpg) 默认相对路径，需加上
                    url = './' + url;
                  }

                  let src = '';
                  let new_src = '';
                  let filename = url.split('/').pop();
                  const ext: any = url
                    .split('/')
                    .pop()
                    .split('.')
                    .pop();

                  // 新的文件名称
                  filename = filename.split('.').shift() + '_' + md5(item).substr(0, 7) + '.' + ext;

                  const fontDir: any = join(publicEntry, fontOptions.path);
                  const realPath = join(fontDir, filename);

                  if (!fs.existsSync(fontDir)) {
                    fs.mkdirpSync(fontDir);
                  }

                  // 获取真实的本地资源地址
                  const mod = requireResolve(url, resolve(reference));
                  if (!mod || !mod.src) {
                    throw new Error(`Path '${url}' could not be found for '${reference}'`);
                  } else {
                    // 解析到的全路径
                    src = mod.src;
                  }

                  const data = fs.readFileSync(src);

                  // 获取当前最新的静态资源地址
                  if (dev()) {
                    // 开发模式 memory 内存文件类型
                    const new_dir = '/static/' + fontOptions.path;
                    if (!memoryFile.existsSync(new_dir)) {
                      memoryFile.mkdirpSync(new_dir);
                    }
                    new_src = new_dir + filename;
                  } else {
                    new_src = [
                      publicPath === './' ? '../' : publicPath,
                      fontOptions.path,
                      filename
                    ].join('');
                  }

                  // 本地文件转移
                  if (dev()) {
                    state.fonts[new_src] = src;
                    memoryFile.writeFileSync(new_src, data);
                  } else {
                    if (write) {
                      fs.copySync(src, realPath);
                    }
                  }
                  decl.value = decl.value.replace(codeUrl, new_src);
                  global.staticSource[new_src] = data;
                });
              }
            }
          });
        }
      });
    };
  }
);
