import { loadParams } from 'award-utils';
import { IOpt1 } from '../../interfaces/fetchOptions';
import fetch from '../../utils/fetch';

module.exports = (options: IOpt1) => {
  // url
  if (!/^http(s)?:|^\/\//.test(options.url) && (options as any).basename) {
    const { basename } = loadParams.get();
    if (basename && !new RegExp(`^${basename}`).test(options.url)) {
      options.url = basename + (/^\//.test(options.url) ? '' : '/') + options.url;
    }
  }
  return fetch(options);
};
