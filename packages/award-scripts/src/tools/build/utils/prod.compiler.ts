/**
 * 完成编译的核心步骤
 */
import * as webpack from 'webpack';

/**
 * config webpack配置文件
 */
export default function(compiler: webpack.Compiler): Promise<undefined> {
  return new Promise((resolve, reject) => {
    // 编译完成触发
    compiler.hooks.done.tap('done', stats => {
      if (stats.compilation.errors && stats.compilation.errors.length) {
        reject();
      }
    });
    // 开始执行编译
    compiler.run(err => {
      if (err) {
        reject();
      }
      process.nextTick(() => {
        resolve();
      });
    });
  });
}
