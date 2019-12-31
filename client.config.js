console.log(process.argv);

let isClient = false;
let isServer = false;
let isTool = false;

const client = process.argv.indexOf('client');
const server = process.argv.indexOf('server');
const tool = process.argv.indexOf('tool');

if (client !== -1) {
  isClient = true;
  process.argv.splice(client, 1);
}

if (server !== -1) {
  isServer = true;
  process.argv.splice(server, 1);
}

if (tool !== -1) {
  isTool = true;
  process.argv.splice(tool, 1);
}

console.log(3, process.argv);

if (!isClient && !isServer && !isTool) {
  isClient = true;
  isServer = true;
  isTool = true;
}

module.exports = {
  testRegex: './__tests__/.*.spec.tsx?',
  collectCoverageFrom: [
    isClient ? 'packages/{award,award-fetch,award-router,award-utils}/src/**/*.ts' : '', // client
    isServer ? 'packages/{award-plugin,award-render,award-server}/src/**/*.tsx' : '', // server
    isTool ? 'package/award-scripts/src/**/*.tsx' : '' // 工具包
  ],
  coverageDirectory: './coverage/',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testPathIgnorePatterns: ['__snapshots__', 'node_modules', 'tools', 'dist'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '(.*)award.config.js': '$1award.config.js',
    '(.*)\\.award(.*)': '$1.award$2',
    '^@/fixtures(.*)': '<rootDir>/fixtures$1', // 针对@/fixtures
    '(.*)fixtures(.*)': '$1fixtures$2', // root/fixtures/项目
    'award/package.json': '<rootDir>/packages/award/package.json',
    'award-scripts/package.json': '<rootDir>/packages/award-scripts/package.json',
    'award/server': '<rootDir>/packages/award/server.js',
    'award-scripts/prepare': '<rootDir>/packages/award-scripts/prepare.js',
    'award-scripts/src/tools/babel/babel-config':
      '<rootDir>/packages/award-scripts/src/tools/babel/babel-config',
    'award-(.*)/(.*)': '<rootDir>/packages/award-$1/src/$2',
    'award-(.*)': '<rootDir>/packages/award-$1/src',
    award: '<rootDir>/packages/award/src'
  }
};
