/**
 * https://github.com/typicode/husky
 * 只识别packages和tools里面的项目的src内容发生变化
 */
const diffPackages = require('./scripts/shared/diffPackages');
const hooks = {};

if (diffPackages()) {
  hooks['pre-commit'] = 'npm run prettier -- --change && npm run eslint -- --change';
}

module.exports = {
  hooks
};
