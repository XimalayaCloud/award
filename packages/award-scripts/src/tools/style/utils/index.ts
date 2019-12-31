// 判断是否是object
export const isObject = (obj: any) => {
  if (typeof obj !== 'undefined' && Object.prototype.toString.call(obj) === '[object Object]') {
    return true;
  }
  return false;
};

// 判断是否import引入了需要解析的后缀
export const shouldBeParseStyle = (_path: any) => {
  const accept = ['.scss', '.sass', '.css'];

  for (const extension of accept) {
    if (_path.endsWith(extension)) {
      return true;
    }
  }

  return false;
};

// 判断是否import引入了需要解析的后缀
export const shouldBeParseImage = (_path: any) => {
  const accept = ['.png', '.jpg', '.gif', '.jpeg', '.svg'];

  for (const extension of accept) {
    if (_path.endsWith(extension)) {
      return true;
    }
  }

  return false;
};

export const dev = () =>
  process.env.NODE_ENV === 'development' || typeof process.env.NODE_ENV === 'undefined';
