import * as path from 'path';
import * as fs from 'fs-extra';
import * as loaderUtils from 'loader-utils';
import validateOptions = require('schema-utils');
import { clean } from '../../../../tool';
import { Constant } from 'award-utils/server';
import schema from './options';

const dir = process.cwd();

const cacheMap = path.join(dir, 'node_modules', Constant.IAMGECACHENAME);

clean(cacheMap);

export default function imageLoader(this: any, content: any) {
  const options = loaderUtils.getOptions(this) || {};

  validateOptions(schema, options, 'image Loader');

  const context = options.context || this.rootContext;

  const url = loaderUtils.interpolateName(this, options.name, {
    context,
    content,
    regExp: options.regExp
  });

  const _path = path.relative(dir, this.resourcePath);
  let map: any = {};
  if (fs.existsSync(cacheMap)) {
    map = JSON.parse(fs.readFileSync(cacheMap, 'utf-8'));
  }

  map[_path] = url;
  fs.writeFileSync(cacheMap, JSON.stringify(map));
}

export const raw = true;
