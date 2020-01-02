/**
 * 返回true即把当前file过滤掉
 */

module.exports = (filePath, opts) => {
  opts.name = opts.name.replace(/^award-plugin-/, '');
  return false;
};
