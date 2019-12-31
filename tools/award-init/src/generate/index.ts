import * as path from 'path';
import * as chalk from 'chalk';
import * as fs from 'fs-extra';
import * as os from 'os';
import Metalsmith = require('metalsmith');

import askQuestions from './plugins/askQuestions';
import filterFiles from './plugins/filterFiles';
import renderTemplateFiles from './plugins/renderTemplateFiles';

import getOptions from './utils/options';
import * as logger from '../utils/logger';

/**
 *
 * src 表示下载模板存放的目录地址
 *
 * dest 表示输出的目录地址
 *
 * done 回调函数，在模板生成结束后触发，默认为null
 *
 */
export default (src: any, dest: any, done: any = null) => {
  // 模板默认名称
  const name = dest.split(os.type() === 'Windows_NT' ? '\\' : '/').pop();
  const ignoreFile = path.join(src, '.renderignore');
  let ignore: any = [];
  if (fs.existsSync(ignoreFile)) {
    ignore = fs
      .readFileSync(ignoreFile, 'utf-8')
      .split('\n')
      .filter(item => item !== '');
  }
  const opts: any = getOptions(name, src);
  const templateDir = path.join(src, 'template')
  const meta = new Metalsmith(templateDir);
  const data = Object.assign(meta.metadata(), {
    templateDir,
    destDirName: name,
    destDir: dest,
    inPlace: dest === process.cwd(),
    cliIgnoreFile: ignore
  });

  meta
    .use(askQuestions(opts.prompts))
    .use(filterFiles(opts.filter))
    .use(renderTemplateFiles);

  meta
    .clean(true)
    .source('.')
    .destination(dest)
    .build(async (err: any, files: any) => {
      if (err) {
        logger.fatal(err);
      }
      if (typeof opts.complete === 'function') {
        opts.complete(data, { chalk, files });
      }
      if (done && typeof done === 'function') {
        done();
      }
    });
};
