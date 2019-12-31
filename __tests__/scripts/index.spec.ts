/**
 * 测试Award项目的开发启动服务
 */

describe('测试Award项目的开发启动服务', () => {
  it('常规测试 - 开发环境启动', done => {
    const root = require.resolve('@/fixtures/with-data/b/index.js').replace(/\/index\.js$/, '');
    process.chdir(root);
    process.argv[2] = 'dev';
    const Server = require('award/server');
    jest.mock('deasync', () => ({
      loopWhile: () => {}
    }));
    const app = new Server();
    app.listen(12909, (mylisten: any) => {
      // 表示正常启动
      expect(process.env.CHILDPROCESS_COMPILER_URL).toBeDefined();
      mylisten.close(done);
    });
  });
});
