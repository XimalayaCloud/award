/**
 * 提供给开发环境和生产环境的统一启动服务
 * 请不要随意修改这里的代码
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
            port,
            ignore: Boolean(params.ignore)
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

module.exports = class {
  values = [];
  init = {};
  constructor(params = {}) {
    this.init = params;
  }
  use() {
    this.values.push({
      name: 'use',
      arguments: arguments
    });
  }
  core() {
    this.values.push({
      name: 'core'
    });
  }
  logFilter() {
    this.values.push({
      name: 'logFilter',
      arguments: arguments
    });
  }
  log() {
    this.values.push({
      name: 'log',
      arguments: arguments
    });
  }
  catch() {
    this.values.push({
      name: 'catch',
      arguments: arguments
    });
  }
  router() {
    this.values.push({
      name: 'router',
      arguments: arguments
    });
  }
  listen(port, cb) {
    if (typeof port === 'string' || typeof port === 'number') {
      this.init['port'] = port;
    }
    const app = new Server(this.init);
    this.values.map(item => {
      switch (item.name) {
        case 'use':
          app.use.apply(app, arguments);
          break;
        case 'core':
          app.core();
          break;
        case 'logFilter':
          app.logFilter.apply(app, arguments);
          break;
        case 'log':
          app.log.apply(app, arguments);
          break;
        case 'catch':
          app.catch.apply(app, arguments);
          break;
        case 'router':
          app.router.apply(app, arguments);
          break;
        default:
          break;
      }
    });
    app.listen.apply(app, arguments);
  }
};
