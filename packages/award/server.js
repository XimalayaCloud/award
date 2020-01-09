/**
 * 提供开发环境和生产环境统一的启动服务
 */
const argvs = process.argv.slice(2);

class DebugServer {
  use() {}
  core() {}
  listen() {}
  logFilter() {}
  log() {}
  catch() {}
  router() {}
}

let Server = null;
// 表示开发环境
if (argvs[0] === 'dev' || argvs[0] === 'debug') {
  try {
    require('./bin/install')();

    if (argvs[0] === 'dev') {
      // 准备工作
      const DevServer = require('award-scripts').Server;
      class AwardServer extends DevServer {
        constructor(params = {}) {
          const port = Number(params.port || 1234);
          require('award-scripts/prepare')(true, true, port);
          super({
            isProxy: Boolean(params.isProxy),
            port
          });
        }
      }
      Server = AwardServer;
    }

    if (argvs[0] === 'debug') {
      const { spawn } = require('child_process');
      process.env.AWARD_DEBUG = 1;
      spawn('node', ['--inspect', process.argv[1], 'dev'], { stdio: 'inherit' });
      Server = DebugServer;
    }
  } catch (error) {}
} else {
  const ProdServer = require('award-server').Server;
  class AwardServer extends ProdServer {
    constructor(params = {}) {
      super({
        isProxy: Boolean(params.isProxy),
        port: params.port || 1234
      });
    }
  }
  Server = AwardServer;
}

module.exports = Server;
