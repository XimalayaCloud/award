/**
 * 手动执行babel处理代码
 */
const babel = require('@babel/core');
const dropConsole = require('./drop_console.log');

module.exports = source => {
  return babel.transform(source, {
    plugins: [dropConsole]
  }).code;
};
