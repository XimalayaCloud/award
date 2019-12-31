#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
require('./install')();

process.env.AWARD_DEBUG = 1;
spawn('node', ['--inspect', path.join(__dirname, 'index.js'), ...process.argv.splice(2)], {
  stdio: 'inherit'
});
