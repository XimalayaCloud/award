import * as postcss from 'postcss';
import * as fs from 'fs-extra';
import * as md5 from 'md5';
import { resolve, join } from 'path';
import { requireResolve, memoryFile } from '../../help';

import { dev } from '../utils';

const cwd = process.cwd();

export default postcss.plugin(
  'postcss-font',
  ({ publicPath, publicEntry, write, fontOptions, state }: any = {}) => {
    return (root: any) => {
      root.walkAtRules((rule: any) => {
        if (rule.name === 'font-face') {
          rule.walkDecls((decl: any) => {
            if (decl.prop === 'src') {
              const match = decl.value.match(/url\(([@|'|"|h|\/|.])([^)]*)\)/g);

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

                  let isAt = false;

                  if (/^@\//.test(url)) {
                    // 如果以@开头，那么需要添加全路径
                    isAt = true;
                    url = join(cwd, url.replace(/^@\//, ''));
                  }

                  if (!/^[\.|\/]/.test(url) && !isAt) {
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

                  // 获取真实的本地资源地址
                  if (!isAt) {
                    const reference = decl.source.input.from;

                    const mod = requireResolve(url, resolve(reference));
                    if (!mod || !mod.src) {
                      throw new Error(`Path '${url}' could not be found for '${reference}'`);
                    } else {
                      // 解析到的全路径
                      src = mod.src;
                    }
                  } else {
                    src = url;
                  }

                  const data = fs.readFileSync(src);

                  // 新的文件名称
                  filename = filename.split('.').shift() + '_' + md5(data).substr(0, 7) + '.' + ext;

                  let outputFile: any = fontOptions.path + filename;
                  // 获取当前最新的静态资源地址
                  if (dev()) {
                    // 开发模式 memory 内存文件类型
                    const new_dir = '/static/' + fontOptions.path;
                    if (!memoryFile.existsSync(new_dir)) {
                      memoryFile.mkdirpSync(new_dir);
                    }

                    outputFile = new_dir + filename;
                    memoryFile.writeFileSync(outputFile, data);
                    state.fonts[outputFile] = src;

                    new_src = '/award_dev_static' + outputFile;
                  } else {
                    new_src = [
                      publicPath === './' ? '../' : publicPath,
                      fontOptions.path,
                      filename
                    ].join('');
                    if (write) {
                      const fontDir: any = join(publicEntry, fontOptions.path);
                      const realPath = join(fontDir, filename);

                      if (!fs.existsSync(fontDir)) {
                        fs.mkdirpSync(fontDir);
                      }
                      fs.copySync(src, realPath);
                    }
                  }
                  decl.value = decl.value.replace(codeUrl, new_src);
                  global.staticSource[outputFile] = data;
                });
              }
            }
          });
        }
      });
    };
  }
);
