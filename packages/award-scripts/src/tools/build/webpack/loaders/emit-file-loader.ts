import * as loaderUtils from 'loader-utils';
import * as path from 'path';

export default function emitFileLoader(this: any, content: any, sourceMap: any) {
  this.cacheable();
  const query = loaderUtils.getOptions(this);

  const name = query.name || '[hash].[ext]';
  const pwd = query.pwd;
  const context = query.context || this.rootContext || (this.options && this.options.context);
  const regExp = query.regExp;
  const opts = {
    context,
    content,
    regExp
  };
  let interpolatedName = loaderUtils.interpolateName(this, name, opts);

  interpolatedName = path.resolve(pwd, interpolatedName);
  interpolatedName = path.relative(pwd, interpolatedName);
  const emit = (code: any) => {
    interpolatedName = interpolatedName.replace(/\.(jsx?|tsx?)$/, '.js');
    this.emitFile(interpolatedName, code, false);
    this.callback(null, code);
  };

  if (query.transform) {
    const transformed = query.transform({
      content,
      sourceMap,
      interpolatedName
    });
    return emit(transformed.content);
  }

  return emit(content);
}
