import * as path from 'path';
import * as babel from '@babel/core';
import * as loaderUtils from 'loader-utils';

const right = () => {
  return {
    name: 'ast-transform', // not required
    visitor: {
      Program(_path: any) {
        _path.node.body = [_path.node.body[0].expression.right];
      }
    }
  };
};

export default function filenameLoader(content: string) {
  const options = loaderUtils.getOptions(this) || {};
  if (options.publicPath === './') {
    const code = (babel as any).transform(content, {
      plugins: [right]
    }).code;
    const pathfile = path.join(__dirname, '..', 'runtime', 'handle.js');
    return `module.exports = require('${pathfile}').default(${code})`;
  } else {
    return content;
  }
}
