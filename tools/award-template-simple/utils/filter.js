/**
 * 返回true即把当前file过滤掉
 */

const tsFile = ['tsconfig.json', 'index.d.ts', 'index.tsx'];
const jsFile = ['index.js'];

const spa = [];
const ssr = ['server.js'];

module.exports = (filePath, opts) => {
  opts.awardVersion = 'latest';

  // 过滤不同选择下的文件
  let file = opts.jsType === 'js' ? tsFile : jsFile;
  file = opts.projectType === 'ssr' ? [...file, ...spa] : [...file, ...ssr];
  if (file.indexOf(filePath) !== -1) {
    return true;
  }
};
