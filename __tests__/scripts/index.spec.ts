/**
 * 测试Award项目的开发启动服务
 */
import * as os from 'os';
const isWin = os.type() === 'Windows_NT';

describe('测试Award项目的开发启动服务', () => {
  it('常规测试 - 开发环境启动', (done) => {
    const root = require
      .resolve('@/fixtures/with-data/b/index.js')
      .replace(isWin ? /\\index\.js$/ : /\/index\.js$/, '');
    process.chdir(root);

    jest.mock('award-plugin-demo', () => ({}));
    jest.mock('award-plugin-demo-test', () => ({}));

    process.argv[2] = 'dev';
    const Server = require('award/server');
    jest.mock('deasync', () => ({
      loopWhile: () => {}
    }));
    const app = new Server();
    app.listen(12909, (mylisten: any) => {
      // 表示正常启动
      console.log(333, process.env.CHILDPROCESS_COMPILER_URL, mylisten, 'done', done);
      // expect(process.env.CHILDPROCESS_COMPILER_URL).toBeDefined();
      mylisten.close(() => {
        console.log('close');
        done();
      });
    });
  });
});
