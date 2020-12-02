#!/usr/bin/env node

require('./install')();
const reset = '\x1B[0m';
const boldGreenBright = (str) => {
  return '\x1B[1m\x1B[92m' + str + reset + reset;
};

const argvs = process.argv.slice(2);
const commanders = ['dev', 'build', 'export', 'info', 'start', 'umd'];
if (commanders.indexOf(argvs[0]) === -1) {
  console.log(`${boldGreenBright('award ' + argvs[0])} 命令不存在`);
  process.exit(-1);
}
if (argvs.indexOf('-h') === -1 && argvs.indexOf('--help') === -1 && argvs[0] !== 'info') {
  let targetPort = null;
  let key = null;
  if (argvs[0] === 'dev') {
    const p = argvs.indexOf('-p');
    const port = argvs.indexOf('--port');
    targetPort = 1234;
    if (port !== -1) {
      key = port + 1;
    }
    if (p !== -1) {
      key = p + 1;
    }
    if (key) {
      targetPort = argvs[key];
    }
  }
  const newPort = require('award-scripts/prepare')(true, true, targetPort);
  if (newPort) {
    if (key) {
      process.argv[key + 2] = newPort;
    } else {
      process.argv.push('-p', newPort);
    }
  }
}
require('award-scripts').scripts();
