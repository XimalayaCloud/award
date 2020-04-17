import forEach = require('lodash/forEach');
import isNull = require('lodash/isNull');
import isPlainObject = require('lodash/isPlainObject');
import isString = require('lodash/isString');
import isUndefined = require('lodash/isUndefined');

/**
 * a=1 => {a: 1}
 * "[{a:2}]" => [{a:2}]
 */
function string2Object(str: string) {
  let data = {};
  try {
    data = JSON.parse(str);
  } catch (error) {
    data = str.split('&').reduce((res: object, item: string) => {
      const arr = item.split('=');
      (res as any)[arr[0]] = arr[1];
      return res;
    }, {});
  }
  return data;
}

/**
 * [description]
 * @param  {[string | object]} data
 * @param  {[any]} returnObj [是否返回{}格式]
 * @return {[string | object]}
 */
export default function(_data?: string | object, returnObj?: string) {
  let data = _data;
  if (!data) {
    return returnObj === 'object' ? {} : '';
  }

  // formdata
  if (!isPlainObject(data) && !isString(data)) {
    return data;
  }

  if (returnObj === 'object') {
    if (isString(data)) {
      data = string2Object(data);
    }

    return JSON.stringify(data);
  }

  if (returnObj === 'json') {
    if (isString(data)) {
      data = string2Object(data);
    }

    return JSON.stringify(data);
  }

  // a=1&b=2
  if (!isPlainObject(data)) {
    return data;
  }

  // {a: 1}
  const str: string[] = [];
  forEach(data as object, (v, key) => {
    let val: string = v;
    if (isUndefined(val) || isNull(val)) {
      val = '';
    }
    str.push(encodeURIComponent(key) + '=' + encodeURIComponent(val));
  });

  return str.join('&');
}
