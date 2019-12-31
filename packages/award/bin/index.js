#!/usr/bin/env node

require('./install')();

const argvs = process.argv.slice(2);
if (argvs.indexOf('-h') === -1 && argvs.indexOf('--help') === -1 && argvs[0] !== 'info') {
  let targetPort = null;
  if (argvs[0] === 'dev') {
    const p = argvs.indexOf('-p');
    const port = argvs.indexOf('--port');
    targetPort = 1234;
    if (port !== -1) {
      targetPort = argvs[port + 1];
    }
    if (p !== -1) {
      targetPort = argvs[p + 1];
    }
  }
  require('award-scripts/prepare')(true, true, targetPort);
}
require('award-scripts').scripts();
