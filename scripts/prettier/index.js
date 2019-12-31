/**
 * 代码风格美化
 *
 * 执行命令
 *
 * 1. 指定某个package，不指定，默认全部
 * 2. --change 只检测git发生变化的代码
 * 3. --test 检测测试代码，即__tests__和__mocks__文件夹
 * npm run prettier -- <指定某个package> --change --test
 *
 */

const prettier = require('../shared/prettier');
const argv = require('minimist')(process.argv.slice(2));

const package = argv._[0] || '**';
let allPaths = `packages/${package}/src/**/*.{ts,tsx}`;

if (argv.test) {
  allPaths = `packages/${package}/{__tests__,__mocks__}/**/*.{ts,tsx}`;
}

prettier(allPaths);
