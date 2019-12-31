export default function(url: string) {
  if (process.env.WEB_TYPE === 'WEB_SPA') {
    if (process.env.RUN_ENV === 'node') {
      // node端执行，说明是提取资源产生的图片、字体资源，如果是./，需要转成../
      if (/^\.\//.test(url)) {
        // ./ 开头
        return '.' + url;
      }
    }
  }
  return url;
}
